import { fileURLToPath, URL } from "node:url"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/postcss"
import { defineConfig } from "vite"

// The Nest API is proxied under the same origin in development so that the
// httpOnly refresh cookie stays first-party. Point PROXY_TARGET at the API.
const proxyTarget = process.env.PROXY_TARGET ?? "http://localhost:5000"

export default defineConfig({
    plugins: [react()],
    css: {
        postcss: {
            plugins: [tailwindcss()],
        },
    },
    resolve: {
        alias: {
            // `@workspace/ui/*` is resolved via the package's own `exports`
            // map (which points e.g. globals.css at src/styles/globals.css),
            // so it is intentionally not aliased here.
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    server: {
        port: 5173,
        proxy: {
            "/api": {
                target: proxyTarget,
                changeOrigin: true,
            },
        },
    },
})
