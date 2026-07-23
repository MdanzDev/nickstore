import devServer from "@hono/vite-dev-server"
import path from "path"
const __dirname = import.meta.dirname
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [
    devServer({ entry: "api-src/boot.ts", export: "app", exclude: [/^\/(?!api\/).*$/] }),
    react()
  ],
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