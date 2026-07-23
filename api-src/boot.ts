import "dotenv/config";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { handle } from "hono/vercel";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import * as cookie from "cookie";
import { appRouter } from "./_src/router";
import { createContext } from "./_src/context";
import { serve } from "@hono/node-server";
import { serveStaticFiles } from "./_src/lib/vite";
import { syncAllPendingLogic } from "./_src/orders-router";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// ============================================================
// 1. IMAGE PROXY - Serve images from Express API (BEFORE catch-all)
// ============================================================
// api/boot.ts - Updated image proxy

// ============================================================
// IMAGE PROXY - Serve all images through same origin
// ============================================================
// ============================================================
// IMAGE PROXY - Must be FIRST before any other routes
// ============================================================
app.get("/img/:filename", async (c) => {
  const filename = c.req.param("filename");
  const API_BASE_URL = "https://api.kryz-net.space";
  const API_KEY = process.env.EXTERNAL_API_KEY || "dev-secret-key";

  console.log(`[IMG PROXY] Request for: ${filename}`);

  try {
    const response = await fetch(`${API_BASE_URL}/img/${filename}`, {
      headers: {
        "x-api-key": API_KEY,
      },
    });

    console.log(`[IMG PROXY] Upstream status: ${response.status}, type: ${response.headers.get("content-type")}`);

    if (!response.ok) {
      return c.notFound();
    }

    const contentType = response.headers.get("content-type") || "image/png";
    const buffer = await response.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err: any) {
    console.error(`[IMG PROXY] Error:`, err.message);
    return c.notFound();
  }
});

// ============================================================
// 2. IMAGE UPLOAD PROXY
// ============================================================
const uploadProxyHandler = async (c: any) => {
  const productId = c.req.param("id");
  const API_KEY = process.env.EXTERNAL_API_KEY || "dev-secret-key";
  const API_BASE_URL = "https://api.kryz-net.space";

  const cookieHeader = c.req.header("cookie") || "";
  const cookies = cookie.parse(cookieHeader);
  const jwtToken = cookies["external_jwt"];

  if (!jwtToken) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const formData = await c.req.formData();
    const file = formData.get("image");

    if (!file || !(file instanceof File)) {
      return c.json({ error: "No image file provided" }, 400);
    }

    const proxyForm = new FormData();
    proxyForm.append("image", file, file.name);

    const response = await fetch(`${API_BASE_URL}/api/v1/admin/games/${productId}/image`, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Authorization": `Bearer ${jwtToken}`,
      },
      body: proxyForm,
    });

    if (!response.ok) {
      const err = (await response.json().catch(() => ({ error: "Upload failed" }))) as any;
      return c.json({ error: err.error || "Upload failed" }, response.status as any);
    }

    const data = await response.json();
    return c.json(data);
  } catch (err: any) {
    console.error("Upload proxy error:", err);
    return c.json({ error: err.message || "Upload failed" }, 500);
  }
};

app.post("/api/products/:id/images", uploadProxyHandler);
app.post("/api/games/:id/images", uploadProxyHandler);

// ============================================================
// 3. tRPC HANDLER
// ============================================================
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

// ============================================================
// DEBUG ENVIRONMENT VARIABLES
// ============================================================
app.get("/api/debug-env", (c) => {
  return c.json({
    EXTERNAL_API_URL: process.env.EXTERNAL_API_URL || "NOT SET (fallback: https://api.kryz-net.space)",
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
  });
});

// ============================================================
// 4. VERCEL CRON JOB - SYNC ORDERS
// ============================================================
app.all("/api/cron/sync", async (c) => {
  console.log(`[CRON] /api/cron/sync triggered`);
  
  // CRON endpoint must verify it was called by Vercel cron
  const authHeader = c.req.header("Authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Only enforce CRON_SECRET if it's set (for local dev it might not be)
    console.error(`[CRON] Unauthorized request to /api/cron/sync`);
    return c.json({ error: "Unauthorized" }, 401);
  }

  const email = process.env.CRON_ADMIN_EMAIL;
  const password = process.env.CRON_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(`[CRON] CRON_ADMIN_EMAIL or CRON_ADMIN_PASSWORD not set.`);
    return c.json({ error: "Admin credentials for CRON not configured." }, 500);
  }

  try {
    const API_BASE_URL = process.env.EXTERNAL_API_URL || "https://api.kryz-net.space";
    console.log(`[CRON] Authenticating admin...`);
    const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!loginRes.ok) {
      console.error(`[CRON] Admin login failed: ${loginRes.statusText}`);
      return c.json({ error: "Admin authentication failed" }, 401);
    }

    const loginData: any = await loginRes.json();
    const jwtToken = loginData.token;

    if (!jwtToken) {
      console.error(`[CRON] Admin login succeeded but no token returned.`);
      return c.json({ error: "Token missing from admin login response" }, 500);
    }

    console.log(`[CRON] Authentication successful. Starting sync...`);
    const result = await syncAllPendingLogic(jwtToken);
    console.log(`[CRON] Sync complete. Result:`, result);
    return c.json(result);
  } catch (err: any) {
    console.error(`[CRON] Error during sync:`, err.message);
    return c.json({ error: "Internal Server Error", details: err.message }, 500);
  }
});

// ============================================================
// 5. WEBHOOK CALLBACK
// ============================================================
app.all("/api/callback", async (c) => {
  const API_BASE_URL = "https://api.kryz-net.space";
  
  try {
    const body = await c.req.text();
    const headers = new Headers(c.req.raw.headers);
    headers.delete("host"); // Let fetch set the correct host
    
    console.log(`[WEBHOOK] Received callback, forwarding to backend...`);
    
    const response = await fetch(`${API_BASE_URL}/api/callback`, {
      method: c.req.method,
      headers,
      body: ["GET", "HEAD"].includes(c.req.method) ? undefined : body,
    });

    const resHeaders = new Headers(response.headers);
    resHeaders.delete("content-encoding");
    resHeaders.delete("content-length");
    resHeaders.delete("transfer-encoding");
    
    return new Response(response.body, {
      status: response.status,
      headers: resHeaders,
    });
  } catch (err: any) {
    console.error(`[WEBHOOK] Error forwarding callback:`, err.message);
    return c.json({ error: "Failed to forward callback" }, 500);
  }
});

// ============================================================
// 5. EXPRESS BACKEND V1 API PROXY
// ============================================================
app.all("/api/v1/*", async (c) => {
  const API_BASE_URL = process.env.EXTERNAL_API_URL || "https://api.kryz-net.space";
  const urlObj = new URL(c.req.raw.url);
  const targetUrl = `${API_BASE_URL}${urlObj.pathname}${urlObj.search}`;

  try {
    const headers = new Headers(c.req.raw.headers);
    headers.delete("host");
    headers.delete("accept-encoding"); // Ask backend to send uncompressed body to proxy

    const body = ["GET", "HEAD"].includes(c.req.method) ? undefined : await c.req.text();

    const response = await fetch(targetUrl, {
      method: c.req.method,
      headers,
      body,
    });

    const resHeaders = new Headers(response.headers);
    resHeaders.delete("content-encoding");
    resHeaders.delete("content-length");
    resHeaders.delete("transfer-encoding");

    return new Response(response.body, {
      status: response.status,
      headers: resHeaders,
    });
  } catch (err: any) {
    console.error(`[API V1 PROXY] Error forwarding request to ${targetUrl}:`, err.message);
    return c.json({ error: "Failed to forward request to backend API", details: err.message }, 500);
  }
});

// ============================================================
// 6. CATCH-ALL (LAST)
// ============================================================
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export { app };

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
export const PATCH = handle(app);

if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}