import { useCallback, useState } from "react"
import { sendRequest, type ApiRequest, type ApiResult } from "@/lib/http"

export type RequestStatus = "idle" | "loading" | "success" | "error"

export interface ApiRequestState {
    status: RequestStatus
    /** The API result (present for both 2xx and error statuses). */
    result: ApiResult | null
    /** A transport-level error message (network failure, not an HTTP error). */
    error: string | null
    run: (request: ApiRequest) => Promise<ApiResult | null>
    reset: () => void
}

// Encapsulates the loading / success / error lifecycle for one endpoint call.
// Every request the tester makes goes through this hook so the three states are
// handled uniformly in the UI.
export function useApiRequest(): ApiRequestState {
    const [status, setStatus] = useState<RequestStatus>("idle")
    const [result, setResult] = useState<ApiResult | null>(null)
    const [error, setError] = useState<string | null>(null)

    const run = useCallback(async (request: ApiRequest) => {
        setStatus("loading")
        setError(null)
        try {
            const res = await sendRequest(request)
            setResult(res)
            // A non-2xx HTTP status is still a completed request; surface it as
            // "error" so the UI can colour it, but keep the parsed body.
            setStatus(res.ok ? "success" : "error")
            return res
        } catch (err) {
            // Only network/transport failures land here (fetch rejected).
            const message =
                err instanceof Error ? err.message : "Network request failed"
            setError(message)
            setResult(null)
            setStatus("error")
            console.error("[api] request failed", err)
            return null
        }
    }, [])

    const reset = useCallback(() => {
        setStatus("idle")
        setResult(null)
        setError(null)
    }, [])

    return { status, result, error, run, reset }
}
