import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { UserViewDto } from "@/lib/api/generated/rakto-setu"

// ===================== Types =====================

export type AuthUser = UserViewDto

interface AuthState {
    user: AuthUser | null
    isAuthenticated: boolean
    login: (user: AuthUser) => void
    logout: () => void
    setUser: (user: AuthUser) => void
}

// ===================== Store =====================

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,

            login: (user) => {
                set({ user, isAuthenticated: true })
            },

            logout: () => {
                set({ user: null, isAuthenticated: false })
            },

            setUser: (user) => set({ user }),
        }),
        {
            name: "rakto-setu.auth",
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)
