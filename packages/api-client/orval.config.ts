// orval.config.ts
import { defineConfig, defineTransformer } from 'orval'
import type { OpenApiDocument, OpenApiSchemaObject } from 'orval'

const SPEC_URL = process.env.API_DOCS_URL ?? 'http://localhost:5000/api/docs-json'

const isEnvelopeSchema = (schema: OpenApiSchemaObject) => {
    const properties = schema.properties
    if (!properties || !('data' in properties)) return false

    const required = new Set(schema.required ?? [])
    return ['success', 'data', 'message', 'errors'].every((field) => required.has(field))
}

const unwrapEnvelopeResponses = defineTransformer((spec: OpenApiDocument) => {
    for (const pathItem of Object.values(spec.paths ?? {})) {
        for (const operation of Object.values(pathItem ?? {})) {
            if (!operation || typeof operation !== 'object' || !('responses' in operation)) continue

            for (const [status, response] of Object.entries(operation.responses ?? {})) {
                if (!status.startsWith('2') || !response || !('content' in response)) continue

                const json = response.content?.['application/json']
                const schema = json?.schema
                if (!schema || '$ref' in schema || !isEnvelopeSchema(schema)) continue

                json.schema = schema.properties.data as OpenApiSchemaObject
            }
        }
    }

    return spec
})

export default defineConfig({
    bloodApi: {
        input: {
            target: SPEC_URL,
            override: {
                transformer: unwrapEnvelopeResponses,
            },
        },
        output: {
            target: './src',
            client: 'react-query',
            httpClient: 'axios',
            mode: 'tags',
            override: {
                mutator: {
                    path: './axios-instance.ts',
                    name: 'apiFetch',
                },
            },
            formatter: 'prettier',
        },
    },
})
