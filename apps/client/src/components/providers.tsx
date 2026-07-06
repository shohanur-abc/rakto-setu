import { useEffect, type ReactNode } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { NuqsAdapter } from "nuqs/adapters/react-router/v7"
import { Toaster } from "@workspace/ui/components/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { bootstrapSession } from "@/lib/auth/session"
import { queryClient } from "@/lib/query"

export function Providers({ children }: { children: ReactNode }) {
    // Restore the session from the refresh cookie exactly once on mount.
    useEffect(() => {
        void bootstrapSession()
    }, [])

    return (
        <ThemeProvider>
            <QueryClientProvider client={queryClient}>
                <NuqsAdapter>{children}</NuqsAdapter>
                <Toaster position="top-center" richColors />
            </QueryClientProvider>
        </ThemeProvider>
    )
}
