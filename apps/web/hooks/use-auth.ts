import { useAuthStore, type AuthUser } from "@/lib/stores/auth-store"

/**
 * Thin wrapper around the auth store for component use.
 * Provides a stable API surface — components should use this instead
 * of importing the store directly.
 */
export function useAuth() {
    const user = useAuthStore((s) => s.user)
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
    const login = useAuthStore((s) => s.login)
    const logout = useAuthStore((s) => s.logout)
    const setUser = useAuthStore((s) => s.setUser)

    return {
        user,
        isAuthenticated,
        isRecipient: user?.role === "recipient",
        isDonor: user?.role === "donor",
        isAdmin: user?.role === "admin",
        login,
        logout,
        setUser,
    } satisfies {
        user: AuthUser | null
        isAuthenticated: boolean
        isRecipient: boolean
        isDonor: boolean
        isAdmin: boolean
        login: (user: AuthUser) => void
        logout: () => void
        setUser: (user: AuthUser) => void
    }
}
