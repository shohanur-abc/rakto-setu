import { ApiError } from "@/lib/api/fetch-client"

/** Extract a human-readable message from any thrown API/network error. */
export function toErrorMessage(error: unknown, fallback = "Something went wrong"): string {
    if (error instanceof ApiError) {
        // The envelope's `errors` array often carries the most specific text.
        const body = error.body as { errors?: unknown[]; message?: string } | undefined
        const first = body?.errors?.[0]
        if (typeof first === "string" && first.trim()) return first
        if (error.message) return error.message
    }
    if (error instanceof Error && error.message) return error.message
    return fallback
}
