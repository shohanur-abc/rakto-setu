import { fileURLToPath, URL } from "node:url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// The Nest API is proxied under the same origin in development, so the browser
// makes same-origin requests to `/api/*` and the dev server forwards them to
// the API. Point PROXY_TARGET at the running API (default: local Nest server).
const proxyTarget = process.env.PROXY_TARGET ?? "http://localhost:3000"

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    server: {
        // 5174 so it can run alongside the real SPA (5173).
        port: 5174,
        proxy: {
            "/api": {
                target: proxyTarget,
                changeOrigin: true,
            },
        },
    },
})
