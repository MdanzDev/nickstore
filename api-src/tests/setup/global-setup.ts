import { serve } from "@hono/node-server";
import { spawn, ChildProcess } from "child_process";
import path from "path";

let honoServer: any;
let expressProcess: ChildProcess;
let app: any;

export async function setup() {
  console.log("--- Global Setup Starting ---");

  process.env.EXTERNAL_API_URL = "http://127.0.0.1:5000";
  process.env.EXTERNAL_API_KEY = "dev-secret-key";
  process.env.NODE_ENV = "test";

  // Dynamically import Hono app after env variables are set
  const bootModule = await import("../../../api/boot");
  app = bootModule.default;

  // 1. Launch Hono proxy server on port 3001
  honoServer = serve({
    fetch: app.fetch,
    port: 3001,
    hostname: "127.0.0.1"
  });
  console.log("Hono proxy server running on http://127.0.0.1:3001");

  // 2. Spawn Express API server as child process on port 5000
  const serverPath = "C:/Users/Win10/Documents/GitHub/api.kryz-net.space/server.js";
  const mockPath = path.resolve(import.meta.dirname, "supabase-mock.cjs");

  console.log(`Spawning Express API (port 5000) with preload mock: ${mockPath}`);
  expressProcess = spawn("node", [
    "-r", mockPath,
    serverPath
  ], {
    env: {
      ...process.env,
      PORT: "5000",
      API_PORT: "5000",
      NODE_ENV: "test",
      EXTERNAL_API_KEY: "dev-secret-key",
      PROVIDER_API_KEY: "dev-secret-key",
      PROVIDER_SECRET_KEY: "dev-secret-key"
    },
    stdio: "inherit" // Forward logs to see potential crash/startup logs in test output
  });

  expressProcess.on("error", (err) => {
    console.error("Failed to start Express child process:", err);
  });

  // Give Hono server a brief moment to bind
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Poll Express server health endpoint until it is ready
  console.log("Waiting for Express API server to be ready on port 5000...");
  let ready = false;
  const start = Date.now();
  while (Date.now() - start < 15000) {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/v1/health");
      if (res.ok) {
        ready = true;
        break;
      }
    } catch (e) {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  if (!ready) {
    throw new Error("Express API server failed to become ready on port 5000 within 15 seconds");
  }
  console.log("Express API server is ready on port 5000!");
  console.log("--- Global Setup Complete ---");
}

export async function teardown() {
  console.log("--- Global Teardown Starting ---");
  
  if (honoServer) {
    honoServer.close();
    console.log("Hono proxy server stopped.");
  }

  if (expressProcess && expressProcess.pid) {
    try {
      const { execSync } = await import("child_process");
      console.log(`Killing Express process PID ${expressProcess.pid} tree using taskkill...`);
      execSync(`taskkill /pid ${expressProcess.pid} /f /t`);
      console.log("Express process and all child processes killed.");
    } catch (e: any) {
      console.warn("Failed to kill Express process tree with taskkill, falling back to process.kill():", e.message);
      expressProcess.kill();
    }
  }

  // Double check and clean up the test bridge process port 5001 if taskkill didn't cover it
  try {
    const { execSync } = await import("child_process");
    // Find PID on port 5001 and kill it to prevent port conflicts in future runs
    const stdout = execSync("netstat -ano").toString();
    const lines = stdout.split("\n");
    const port5001Line = lines.find(line => line.includes("127.0.0.1:5001") && line.includes("LISTENING"));
    if (port5001Line) {
      const parts = port5001Line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== "0") {
        console.log(`Cleaning up leftover Test DB bridge process on port 5001 with PID ${pid}`);
        execSync(`taskkill /pid ${pid} /f /t`);
      }
    }
  } catch (e) {}

  console.log("--- Global Teardown Complete ---");
}

export default async function() {
  await setup();
  return async () => {
    await teardown();
  };
}
