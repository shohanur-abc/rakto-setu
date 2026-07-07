import { useEffect, useState } from "react"
import { getToken, setToken, subscribeToken } from "@/lib/auth"

// Top bar showing auth state. The token is normally captured automatically by
// the Login endpoint, but it can also be pasted/cleared manually here.
export function AuthBar() {
    const [token, setLocalToken] = useState<string | null>(getToken())
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState("")

    // Keep in sync when the transport layer captures a token on login.
    useEffect(() => subscribeToken(setLocalToken), [])

    const short = token ? `${token.slice(0, 12)}…${token.slice(-6)}` : null

    return (
        <header className="topbar">
            <div className="brand">
                <span className="brand-dot" />
                RaktoSetu <span className="brand-sub">API Tester</span>
            </div>
            <div className="auth-status">
                {token ? (
                    <>
                        <span className="pill pill-ok">
                            Authenticated
                            <code title={token}>{short}</code>
                        </span>
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => setToken(null)}
                        >
                            Clear
                        </button>
                    </>
                ) : (
                    <span className="pill pill-muted">No token</span>
                )}
                {editing ? (
                    <form
                        className="token-form"
                        onSubmit={(e) => {
                            e.preventDefault()
                            setToken(draft.trim() || null)
                            setEditing(false)
                            setDraft("")
                        }}
                    >
                        <input
                            autoFocus
                            className="token-input"
                            aria-label="Bearer token"
                            placeholder="Paste Bearer token…"
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                        />
                        <button className="btn btn-primary" type="submit">
                            Save
                        </button>
                    </form>
                ) : (
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => setEditing(true)}
                    >
                        Set manually
                    </button>
                )}
            </div>
        </header>
    )
}
