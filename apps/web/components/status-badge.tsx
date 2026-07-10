import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

export type RequestStatus =
    | "draft"
    | "pending_review"
    | "published"
    | "matched"
    | "in_progress"
    | "fulfilled"
    | "cancelled"
    | "expired"
    | "unfulfilled"

const statusStyles: Record<RequestStatus, string> = {
    draft: "bg-muted text-muted-foreground border-border",
    pending_review: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25",
    published: "bg-secondary text-secondary-foreground border-border",
    matched: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25",
    in_progress: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/25",
    fulfilled: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    cancelled: "bg-muted text-muted-foreground border-border line-through",
    expired: "bg-muted text-muted-foreground border-border",
    unfulfilled: "bg-destructive/10 text-destructive border-destructive/20",
}

export function StatusBadge({
    status,
    label,
    className,
}: {
    status: string
    label: string
    className?: string
}) {
    const s = (Object.keys(statusStyles) as RequestStatus[]).includes(
        status as RequestStatus,
    )
        ? (status as RequestStatus)
        : "published"
    return (
        <Badge
            variant="outline"
            className={cn("border font-medium", statusStyles[s], className)}
        >
            {label}
        </Badge>
    )
}
