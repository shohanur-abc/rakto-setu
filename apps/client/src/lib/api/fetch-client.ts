import {
    clearAccessToken,
    getAccessToken,
    setAccessToken,
} from "@/lib/auth/token"

export class ApiError<TBody = unknown> extends Error {
    constructor(
        message: string,
        readonly status: number,
        readonly body: TBody
    ) {
        super(message)
        this.name = "ApiError"
    }
}

// Same-origin by default: the Vite dev server proxies `/api` to the Nest API
// so the httpOnly refresh cookie stays first-party. In production the SPA is
// served behind the same origin as the API (or VITE_API_URL is set).
const getApiBaseUrl = () =>
    (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "")

const parseBody = async (response: Response) => {
    if ([204, 205, 304].includes(response.status)) {
        return undefined
    }

    const text = await response.text()

    if (!text) {
        return undefined
    }

    const contentType = response.headers.get("content-type") ?? ""

    if (!contentType.includes("application/json")) {
        return text
    }

    return JSON.parse(text) as unknown
}

// ---------------- Silent refresh ----------------

// A single in-flight refresh is shared across concurrent 401s so we only hit
// the refresh endpoint once. Resolves to the new access token, or null.
let refreshInFlight: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
    if (!refreshInFlight) {
        refreshInFlight = (async () => {
            try {
                const response = await fetch(
                    `${getApiBaseUrl()}/api/v1/auth/refresh`,
                    { method: "POST", credentials: "include" }
                )

                if (!response.ok) {
                    clearAccessToken()
                    return null
                }

                const body = (await response.json()) as {
                    data?: { token?: string }
                }
                const token = body.data?.token ?? null
                setAccessToken(token)
                return token
            } catch {
                clearAccessToken()
                return null
            } finally {
                refreshInFlight = null
            }
        })()
    }

    return refreshInFlight
}

// ---------------- Core request ----------------

const buildHeaders = (options: RequestInit, token: string | null) => {
    const headers = new Headers(options.headers)

    if (token && !headers.has("authorization")) {
        headers.set("authorization", `Bearer ${token}`)
    }

    return headers
}

const isAuthEndpoint = (url: string) => url.includes("/auth/")

export async function apiFetch<TData>(
    url: string,
    options: RequestInit = {}
): Promise<TData> {
    const send = (token: string | null) =>
        fetch(`${getApiBaseUrl()}${url}`, {
            ...options,
            headers: buildHeaders(options, token),
            credentials: "include",
        })

    let response = await send(getAccessToken())

    // On a 401 for a protected call, try a one-shot silent refresh + retry.
    if (response.status === 401 && !isAuthEndpoint(url)) {
        const refreshed = await refreshAccessToken()

        if (refreshed) {
            response = await send(refreshed)
        }
    }

    const body = await parseBody(response)

    if (!response.ok) {
        const message =
            body &&
            typeof body === "object" &&
            "message" in body &&
            typeof body.message === "string"
                ? body.message
                : `Request failed with status ${response.status}`

        throw new ApiError(message, response.status, body)
    }

    return body as TData
}
