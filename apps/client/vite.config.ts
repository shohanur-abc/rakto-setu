import { fileURLToPath, URL } from "node:url"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/postcss"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
    // Load `.env*` so PROXY_TARGET set there is honoured (Vite does not put it
    // on process.env by itself). Defaults to the local Nest port (see
    // apps/server/.env → PORT=3000); Docker overrides it to the container host.
    const env = loadEnv(mode, process.cwd(), "")
    const proxyTarget =
        env.PROXY_TARGET ?? process.env.PROXY_TARGET ?? "http://localhost:3000"

    return {
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
    }
})
