/// <reference types="vitest" />
import devServer from "@hono/vite-dev-server"
import path from "path"
const __dirname = import.meta.dirname
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [
    devServer({ entry: "api-src/boot.ts", export: "app", exclude: [/^\/(?!api\/).*$/] }),
    react()
  ],
  test: {
    globalSetup: "./api-src/tests/setup/global-setup.ts",
    setupFiles: ["./api-src/tests/setup/test-setup.ts"],
    include: ["api-src/tests/**/*.test.ts"]
  },
  server: {
    port: 3000,
    // ✅ ADD THIS - Proxy /img requests directly to your Express API
    proxy: {
      "/img": {
        target: "https://api.kryz-net.space",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@contracts": path.resolve(__dirname, "./contracts"),
    },
  },
  envDir: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
});