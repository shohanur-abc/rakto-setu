"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthUser {
    id: string
    fullName: string
    phone: string
    role: "recipient" | "donor" | "admin"
}

interface AuthState {
    token: string | null
    user: AuthUser | null
    setAuth: (token: string, user: AuthUser) => void
    clear: () => void
}

/**
 * Client-side auth store. Persists the JWT (returned in the login response
 * body by the NestJS backend) to localStorage. The api-client axios
 * interceptor reads `token` via `configureAuthToken` (see providers.tsx).
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            setAuth: (token, user) => set({ token, user }),
            clear: () => set({ token: null, user: null }),
        }),
        { name: "rakto-setu-auth" },
    ),
)
