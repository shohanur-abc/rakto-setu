// Tiny auth-token store. The tester keeps the JWT in localStorage so it
// survives reloads, and notifies subscribers (the header UI) when it changes.
// This is intentionally the ONLY place that knows where the token lives, so
// the transport layer and UI stay decoupled from the storage mechanism.

const TOKEN_KEY = "raktosetu.api-tester.token"

type Listener = (token: string | null) => void
const listeners = new Set<Listener>()

export function getToken(): string | null {
    try {
        return localStorage.getItem(TOKEN_KEY)
    } catch {
        return null
    }
}

export function setToken(token: string | null): void {
    try {
        if (token) {
            localStorage.setItem(TOKEN_KEY, token)
        } else {
            localStorage.removeItem(TOKEN_KEY)
        }
    } catch {
        // Ignore storage failures (e.g. private mode); token stays in memory
        // only via the listeners below.
    }
    listeners.forEach((fn) => fn(token))
}

export function subscribeToken(fn: Listener): () => void {
    listeners.add(fn)
    return () => listeners.delete(fn)
}
