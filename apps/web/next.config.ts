import type { NextConfig } from "next"
import path from "node:path"

const API_URL = process.env.API_URL || "http://localhost:5000"
const ROOT = path.join(process.cwd(), "..", "..")
const AXIOS_INSTANCE_TS = path.join(ROOT, "packages", "api-client", "axios-instance.ts")
const RQ = path.join(ROOT, "node_modules", "@tanstack", "react-query", "build", "modern", "index.js")
const QC = path.join(ROOT, "node_modules", "@tanstack", "query-core", "build", "modern", "index.js")

const nextConfig: NextConfig = {
    transpilePackages: ["@workspace/ui", "@workspace/i18n"],
    turbopack: {
        root: ROOT,
        resolveAlias: {
            "@tanstack/react-query": "./node_modules/@tanstack/react-query/build/modern/index.js",
            "@tanstack/query-core": "./node_modules/@tanstack/query-core/build/modern/index.js",
            "../axios-instance.js": "../../packages/api-client/axios-instance.ts",
        },
    },
    rewrites: async () => [
        {
            source: "/api/:path*",
            destination: `${API_URL}/api/:path*`,
        },
    ],
    webpack: (config) => {
        config.resolve = config.resolve ?? {}
        config.resolve.alias = config.resolve.alias ?? {}

        // Force a SINGLE physical instance of @tanstack/react-query and
        // @tanstack/query-core. Without this, webpack bundles the same
        // package multiple times (resolved via different conditions / from
        // different importers), producing duplicate QueryClient classes and
        // the runtime error "client.defaultQueryOptions is not a function".
        config.resolve.alias["@tanstack/react-query"] = RQ
        config.resolve.alias["@tanstack/query-core"] = QC

        // The orval-generated api-client imports "../axios-instance.js"
        // (explicit .js) but the source is .ts. Map that exact request.
        config.resolve.alias["../axios-instance.js"] = AXIOS_INSTANCE_TS

        return config
    },
}

export default nextConfig
