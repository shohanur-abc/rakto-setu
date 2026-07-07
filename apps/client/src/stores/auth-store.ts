import { create } from "zustand"
import type { UserViewDto } from "@/lib/api/generated/rakto-setu"
import { clearAccessToken, setAccessToken } from "@/lib/auth/token"
import { normalizeUser } from "@/lib/auth/normalize"

// ===================== Types =====================

export type AuthUser = UserViewDto

type AuthStatus = "loading" | "authenticated" | "unauthenticated"

interface AuthState {
    user: AuthUser | null
    status: AuthStatus
    isAuthenticated: boolean
    /** Persist the access token in memory and mark the session authenticated. */
    login: (user: AuthUser, token: string) => void
    logout: () => void
    setUser: (user: AuthUser) => void
    setUnauthenticated: () => void
}

// ===================== Store =====================

export const useAuthStore = create<AuthState>()((set) => ({
    user: null,
    status: "loading",
    isAuthenticated: false,

    login: (user, token) => {
        setAccessToken(token)
        set({
            user: normalizeUser(user),
            status: "authenticated",
            isAuthenticated: true,
        })
    },

    logout: () => {
        clearAccessToken()
        set({ user: null, status: "unauthenticated", isAuthenticated: false })
    },

    setUser: (user) => set({ user: normalizeUser(user) }),

    setUnauthenticated: () =>
        set({ user: null, status: "unauthenticated", isAuthenticated: false }),
}))
