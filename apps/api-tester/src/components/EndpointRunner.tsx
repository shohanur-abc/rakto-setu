import { useEffect, useMemo, useState } from "react"
import { useApiRequest } from "@/hooks/useApiRequest"
import { setToken } from "@/lib/auth"
import type { EndpointDef } from "@/lib/endpoints"
import { JsonViewer } from "@/components/JsonViewer"

// The main working panel: builds the request form for the selected endpoint,
// sends it, and renders the response with its loading / success / error state.
export function EndpointRunner({ endpoint }: { endpoint: EndpointDef }) {
    const { status, result, error, run, reset } = useApiRequest()

    // ---- form state, re-initialised whenever the endpoint changes ----------
    const [pathValues, setPathValues] = useState<Record<string, string>>({})
    const [queryValues, setQueryValues] = useState<Record<string, string>>({})
    const [bodyText, setBodyText] = useState("")
    const [bodyError, setBodyError] = useState<string | null>(null)

    useEffect(() => {
        reset()
        setPathValues(
            Object.fromEntries((endpoint.pathParams ?? []).map((p) => [p, ""]))
        )
        setQueryValues(
            Object.fromEntries(
                (endpoint.query ?? []).map((q) => [q.name, q.example ?? ""])
            )
        )
        setBodyText(endpoint.body ? JSON.stringify(endpoint.body, null, 2) : "")
        setBodyError(null)
    }, [endpoint, reset])

    // Resolve :params in the path so we can preview the final URL.
    const resolvedPath = useMemo(() => {
        let path = endpoint.path
        for (const param of endpoint.pathParams ?? []) {
            const value = pathValues[param]?.trim()
            path = path.replace(`:${param}`, value ? value : `:${param}`)
        }
        return path
    }, [endpoint, pathValues])

    const missingPathParam = (endpoint.pathParams ?? []).some(
        (p) => !pathValues[p]?.trim()
    )

    const hasBody = endpoint.body !== undefined

    async function onSend() {
        // Validate the JSON body before sending (basic form validation).
        let parsedBody: unknown
        if (hasBody && bodyText.trim()) {
            try {
                parsedBody = JSON.parse(bodyText)
                setBodyError(null)
            } catch (err) {
                setBodyError(
                    err instanceof Error ? err.message : "Invalid JSON body"
                )
                return
            }
        }

        // Drop empty query params so we don't send `?x=`.
        const query = Object.fromEntries(
            Object.entries(queryValues).filter(([, v]) => v.trim() !== "")
        )

        const res = await run({
            method: endpoint.method,
            path: resolvedPath,
            query,
            body: parsedBody,
        })

        // Side effects tied to specific endpoints (login/logout).
        if (res?.ok) {
            if (endpoint.captureToken) {
                const token = extractToken(res.body)
                if (token) setToken(token)
            }
            if (endpoint.clearsToken) setToken(null)
        }
    }

    return (
        <section className="runner">
            <div className="runner-head">
                <span
                    className={`method method-${endpoint.method.toLowerCase()}`}
                >
                    {endpoint.method}
                </span>
                <h2>{endpoint.title}</h2>
                <span className={`access access-${endpoint.access}`}>
                    {endpoint.access}
                </span>
                <span className="spec-id">#{endpoint.id}</span>
            </div>
            <code className="url-preview">/api/v1{resolvedPath}</code>

            {/* -------- Path params -------- */}
            {(endpoint.pathParams ?? []).length > 0 && (
                <fieldset className="field-group">
                    <legend>Path parameters</legend>
                    {endpoint.pathParams!.map((param) => (
                        <label key={param} className="field">
                            <span>{param}</span>
                            <input
                                value={pathValues[param] ?? ""}
                                placeholder={`Enter ${param}…`}
                                onChange={(e) =>
                                    setPathValues((prev) => ({
                                        ...prev,
                                        [param]: e.target.value,
                                    }))
                                }
                            />
                        </label>
                    ))}
                </fieldset>
            )}

            {/* -------- Query params -------- */}
            {(endpoint.query ?? []).length > 0 && (
                <fieldset className="field-group">
                    <legend>Query parameters</legend>
                    {endpoint.query!.map((q) => (
                        <label key={q.name} className="field">
                            <span>{q.name}</span>
                            <input
                                value={queryValues[q.name] ?? ""}
                                placeholder={q.description ?? "optional"}
                                onChange={(e) =>
                                    setQueryValues((prev) => ({
                                        ...prev,
                                        [q.name]: e.target.value,
                                    }))
                                }
                            />
                        </label>
                    ))}
                </fieldset>
            )}

            {/* -------- JSON body -------- */}
            {hasBody && (
                <fieldset className="field-group">
                    <legend>Request body (JSON)</legend>
                    <textarea
                        className={`body-editor${bodyError ? " invalid" : ""}`}
                        aria-label="Request body JSON"
                        spellCheck={false}
                        value={bodyText}
                        onChange={(e) => setBodyText(e.target.value)}
                        rows={Math.min(
                            18,
                            Math.max(6, bodyText.split("\n").length + 1)
                        )}
                    />
                    {bodyError && (
                        <p className="inline-error">Invalid JSON: {bodyError}</p>
                    )}
                </fieldset>
            )}

            <div className="runner-actions">
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={onSend}
                    disabled={status === "loading" || missingPathParam}
                >
                    {status === "loading" ? "Sending…" : "Send request"}
                </button>
                {missingPathParam && (
                    <span className="hint">Fill in path parameters first</span>
                )}
            </div>

            {/* -------- Response -------- */}
            <ResponsePanel status={status} result={result} error={error} />
        </section>
    )
}

function ResponsePanel({
    status,
    result,
    error,
}: Pick<ReturnType<typeof useApiRequest>, "status" | "result" | "error">) {
    if (status === "idle") {
        return (
            <div className="response response-idle">
                Send the request to see the response here.
            </div>
        )
    }

    if (status === "loading") {
        return <div className="response response-loading">Loading…</div>
    }

    // Transport failure (no HTTP response at all).
    if (!result) {
        return (
            <div className="response response-fail">
                <strong>Request failed.</strong>
                <p>{error}</p>
                <p className="hint">
                    Is the API running and reachable? Check the browser console
                    and your VITE_API_URL / proxy settings.
                </p>
            </div>
        )
    }

    const statusClass = result.ok ? "ok" : "err"
    return (
        <div className="response">
            <div className={`response-status response-status-${statusClass}`}>
                <span className="status-code">{result.status}</span>
                <span>{result.statusText}</span>
                <span className="response-meta">{result.durationMs} ms</span>
            </div>
            <JsonViewer value={result.body} isJson={result.isJson} />
        </div>
    )
}

// Pull a bearer token out of a login response envelope: { data: { token } }.
function extractToken(body: unknown): string | null {
    if (body && typeof body === "object" && "data" in body) {
        const data = (body as { data?: unknown }).data
        if (data && typeof data === "object") {
            const token = (data as { token?: unknown; accessToken?: unknown })
                .token
            if (typeof token === "string") return token
            const access = (data as { accessToken?: unknown }).accessToken
            if (typeof access === "string") return access
        }
    }
    return null
}
