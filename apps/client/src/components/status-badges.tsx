import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { useI18n } from "@/lib/i18n/context"
import { humanizeLabel } from "@/lib/format"

// Colour maps keyed by the server's lowercase label values. Unknown values
// fall back to a neutral style + humanised label, so new server enums never
// crash the UI.

const requestStatusStyles: Record<string, string> = {
    draft: "bg-muted text-muted-foreground border-border",
    pending_review:
        "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    published:
        "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    matched:
        "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800",
    in_progress:
        "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800",
    fulfilled:
        "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
    cancelled: "bg-muted text-muted-foreground border-border",
    expired: "bg-muted text-muted-foreground border-border",
    unfulfilled:
        "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
}

const urgencyStyles: Record<string, string> = {
    routine: "bg-muted text-muted-foreground border-border",
    urgent:
        "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    emergency:
        "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
}

const verificationStyles: Record<string, string> = {
    verified:
        "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
    unverified:
        "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    rejected:
        "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
}

const userStatusStyles: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
    pending_verification:
        "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    suspended:
        "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
    deleted: "bg-muted text-muted-foreground border-border",
}

function normalize(value?: string | null) {
    return String(value ?? "").toLowerCase()
}

export function RequestStatusBadge({ status }: { status?: string | null }) {
    const { dictionary } = useI18n()
    const key = normalize(status)
    const label =
        dictionary.app.status[key as keyof typeof dictionary.app.status] ??
        humanizeLabel(status)
    return (
        <Badge
            variant="outline"
            className={cn("font-medium", requestStatusStyles[key])}
        >
            {label}
        </Badge>
    )
}

export function UrgencyBadge({ urgency }: { urgency?: string | null }) {
    const { dictionary } = useI18n()
    const key = normalize(urgency)
    const label =
        dictionary.app.urgencyLevels[
            key as keyof typeof dictionary.app.urgencyLevels
        ] ?? humanizeLabel(urgency)
    return (
        <Badge variant="outline" className={cn("font-medium", urgencyStyles[key])}>
            {label}
        </Badge>
    )
}

export function VerificationBadge({
    verification,
}: {
    verification?: string | null
}) {
    const { dictionary } = useI18n()
    const key = normalize(verification)
    const label =
        dictionary.app.verificationLevels[
            key as keyof typeof dictionary.app.verificationLevels
        ] ?? humanizeLabel(verification)
    return (
        <Badge
            variant="outline"
            className={cn("font-medium", verificationStyles[key])}
        >
            {label}
        </Badge>
    )
}

export function UserStatusBadge({ status }: { status?: string | null }) {
    const key = normalize(status)
    return (
        <Badge
            variant="outline"
            className={cn("font-medium", userStatusStyles[key])}
        >
            {humanizeLabel(status)}
        </Badge>
    )
}
