"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

import { configureAuthToken } from "api-client/axios-instance"
import { useAuthStore } from "@/lib/auth-store"
import { ThemeProvider } from "next-themes"

if (typeof window !== "undefined") {
    configureAuthToken(() => useAuthStore.getState().token)
}

const DEFAULT_QUERY_STALE_TIME = 60 * 1000

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: DEFAULT_QUERY_STALE_TIME,
                        refetchOnWindowFocus: false,
                        retry: 1,
                    },
                },
            }),
    )
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                {children}
            </ThemeProvider>
        </QueryClientProvider>
    )
}
