import type { ReactNode } from "react"

import "@workspace/ui/globals.css"
import { Providers } from "@/components/providers"

/**
 * Root layout — owns <html>/<body> and the client Providers (QueryClient +
 * theme). The QueryClientProvider set here reaches every client section
 * rendered by the Server [lang]/layout and Server page.tsx files (verified
 * working — the React context crosses the Server→Client boundary in
 * Next.js 16 App Router as long as there's a single react-query instance).
 */
export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="min-h-screen bg-background font-sans text-foreground antialiased">
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
