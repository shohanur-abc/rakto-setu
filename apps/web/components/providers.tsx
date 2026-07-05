"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { useEffect } from "react"
import { useAuthStore } from "@/lib/stores/auth-store"
import type { UserViewDto } from "@/lib/api/generated/rakto-setu"

function AuthHydration({
    initialUser,
}: {
    initialUser?: UserViewDto | null
}) {
    const login = useAuthStore((state) => state.login)
    const logout = useAuthStore((state) => state.logout)

    useEffect(() => {
        if (typeof initialUser === "undefined") {
            return
        }

        if (initialUser) {
            login(initialUser)
            return
        }

        logout()
    }, [initialUser, login, logout])

    return null
}

function Providers({
    children,
    initialUser,
}: {
    children: React.ReactNode
    initialUser?: UserViewDto | null
}) {
    return (
        <ThemeProvider>
            <NuqsAdapter>
                <AuthHydration initialUser={initialUser} />
                {children}
            </NuqsAdapter>
        </ThemeProvider>
    )
}

export { Providers }
