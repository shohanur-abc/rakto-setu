import { useAuthStore, type AuthUser } from "@/stores/auth-store"

/**
 * Thin wrapper around the auth store for component use. Components should use
 * this instead of importing the store directly.
 */
export function useAuth() {
    const user = useAuthStore((s) => s.user)
    const status = useAuthStore((s) => s.status)
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
    const login = useAuthStore((s) => s.login)
    const logout = useAuthStore((s) => s.logout)
    const setUser = useAuthStore((s) => s.setUser)

    return {
        user,
        status,
        isAuthenticated,
        isLoading: status === "loading",
        isRecipient: user?.role === "recipient",
        isDonor: user?.role === "donor",
        isAdmin: user?.role === "admin",
        login,
        logout,
        setUser,
    } satisfies {
        user: AuthUser | null
        status: "loading" | "authenticated" | "unauthenticated"
        isAuthenticated: boolean
        isLoading: boolean
        isRecipient: boolean
        isDonor: boolean
        isAdmin: boolean
        login: (user: AuthUser, token: string) => void
        logout: () => void
        setUser: (user: AuthUser) => void
    }
}
