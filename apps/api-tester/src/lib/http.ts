// Thin fetch wrapper — the single transport layer for the whole tester.
// Responsibilities: build the URL (base + `/api/v1` prefix + path + query),
// attach the bearer token, send JSON, and normalise the result into a shape
// the UI can always render (status, headers, parsed/raw body, duration).
//
// It never throws on HTTP error statuses: a 4xx/5xx is a perfectly valid thing
// to *observe* when testing an API, so it's returned like any other response.
import { getToken } from "@/lib/auth"

// API global prefix (see server `app.setGlobalPrefix('api/v1')`).
const API_PREFIX = "/api/v1"

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export interface ApiRequest {
    method: HttpMethod
    path: string // already-resolved path, e.g. "/requests/123"
    query?: Record<string, string>
    body?: unknown
    /** Send the Authorization header (default: true when a token exists). */
    auth?: boolean
}

export interface ApiResult {
    ok: boolean
    status: number
    statusText: string
    durationMs: number
    /** Fully-qualified URL the request was sent to (for debugging). */
    url: string
    headers: Record<string, string>
    /** Parsed JSON when possible, otherwise the raw text. */
    body: unknown
    /** True when the body was JSON and parsed successfully. */
    isJson: boolean
}

// Base origin for the API. Empty string => same origin (dev proxy handles it).
const baseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "")

function buildUrl(path: string, query?: Record<string, string>): string {
    const search = new URLSearchParams()
    for (const [key, value] of Object.entries(query ?? {})) {
        if (value !== "") search.set(key, value)
    }
    const qs = search.toString()
    return `${baseUrl}${API_PREFIX}${path}${qs ? `?${qs}` : ""}`
}

export async function sendRequest(request: ApiRequest): Promise<ApiResult> {
    const url = buildUrl(request.path, request.query)
    const headers = new Headers({ Accept: "application/json" })

    const token = getToken()
    const useAuth = request.auth ?? Boolean(token)
    if (useAuth && token) headers.set("Authorization", `Bearer ${token}`)

    const hasBody =
        request.body !== undefined &&
        request.body !== null &&
        request.method !== "GET"
    if (hasBody) headers.set("Content-Type", "application/json")

    const started = performance.now()
    // credentials:include so the httpOnly refresh cookie flows for /auth/* too.
    const response = await fetch(url, {
        method: request.method,
        headers,
        credentials: "include",
        body: hasBody ? JSON.stringify(request.body) : undefined,
    })
    const durationMs = Math.round(performance.now() - started)

    const text = await response.text()
    let body: unknown = text
    let isJson = false
    if (text) {
        try {
            body = JSON.parse(text)
            isJson = true
        } catch {
            // leave body as raw text (e.g. CSV export, HTML error page)
        }
    }

    const headerMap: Record<string, string> = {}
    response.headers.forEach((value, key) => {
        headerMap[key] = value
    })

    // Debug logging so the network round-trip is visible in the console too.
    const log = response.ok ? console.info : console.warn
    log(`[api] ${request.method} ${url} -> ${response.status} (${durationMs}ms)`, body)

    return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        durationMs,
        url,
        headers: headerMap,
        body,
        isJson,
    }
}
