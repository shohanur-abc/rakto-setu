import type { UserViewDto } from "@/lib/api/generated/rakto-setu"
import { useAuthStore } from "@/stores/auth-store"

const apiBase = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "")

type RefreshEnvelope = {
    success: boolean
    data: { user: UserViewDto; token: string }
}

/**
 * Exchange the httpOnly refresh cookie for a fresh access token on boot.
 * Populates the auth store so a reload keeps the user signed in even though
 * the access token itself never persists to disk.
 */
export async function bootstrapSession() {
    try {
        const response = await fetch(`${apiBase}/api/v1/auth/refresh`, {
            method: "POST",
            credentials: "include",
        })

        if (!response.ok) {
            useAuthStore.getState().setUnauthenticated()
            return
        }

        const body = (await response.json()) as RefreshEnvelope
        useAuthStore.getState().login(body.data.user, body.data.token)
    } catch {
        useAuthStore.getState().setUnauthenticated()
    }
}
