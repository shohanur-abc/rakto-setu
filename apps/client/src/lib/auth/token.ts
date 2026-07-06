// In-memory access token store.
//
// The access token intentionally lives only in memory (never localStorage),
// so it cannot be exfiltrated from disk by XSS and is dropped on reload. The
// long-lived refresh token lives in an httpOnly cookie and is used to mint a
// fresh access token on boot (see session.ts).

let accessToken: string | null = null

export function getAccessToken() {
    return accessToken
}

export function setAccessToken(token: string | null) {
    accessToken = token
}

export function clearAccessToken() {
    accessToken = null
}
