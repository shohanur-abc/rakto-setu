import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { Spinner } from "@/components/spinner"
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@workspace/ui/components/empty"
import { RiLock2Line } from "@remixicon/react"
import { useAuth } from "@/hooks/use-auth"
import { useI18n } from "@/lib/i18n/context"

type Role = "recipient" | "donor" | "admin"

function FullPageSpinner() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <Spinner className="size-6 text-muted-foreground" />
        </div>
    )
}

/**
 * Gate for any authenticated area. While the session is still bootstrapping we
 * show a spinner (avoids a redirect flash on reload); once resolved, an
 * unauthenticated user is bounced to login with a `redirect` back-param.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
    const { status } = useAuth()
    const { lang } = useI18n()
    const location = useLocation()

    if (status === "loading") return <FullPageSpinner />

    if (status === "unauthenticated") {
        const redirect = encodeURIComponent(location.pathname + location.search)
        return <Navigate to={`/${lang}/login?redirect=${redirect}`} replace />
    }

    return <>{children}</>
}

/** Requires one of the given roles in addition to being authenticated. */
export function RoleRoute({
    roles,
    children,
}: {
    roles: Role[]
    children: ReactNode
}) {
    const { status, user } = useAuth()
    const { lang, dictionary } = useI18n()
    const location = useLocation()

    if (status === "loading") return <FullPageSpinner />

    if (status === "unauthenticated") {
        const redirect = encodeURIComponent(location.pathname + location.search)
        return <Navigate to={`/${lang}/login?redirect=${redirect}`} replace />
    }

    if (!user || !roles.includes(user.role as Role)) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-20">
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <RiLock2Line className="text-destructive" />
                        </EmptyMedia>
                        <EmptyTitle>{dictionary.app.states.forbidden}</EmptyTitle>
                        <EmptyDescription>
                            {dictionary.nav.dashboard}
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            </div>
        )
    }

    return <>{children}</>
}
