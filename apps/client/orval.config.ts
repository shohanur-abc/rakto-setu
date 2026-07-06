import { defineConfig } from "orval"

export default defineConfig({
    raktoSetu: {
        input: "../server/openapi.json",
        output: {
            target: "./src/lib/api/generated/rakto-setu.ts",
            mode: "single",
            client: "fetch",
            clean: true,
            override: {
                mutator: {
                    path: "./src/lib/api/fetch-client.ts",
                    name: "apiFetch",
                },
                fetch: {
                    includeHttpResponseReturnType: false,
                },
            },
        },
    },
})
