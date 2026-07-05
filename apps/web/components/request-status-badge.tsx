import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

type RequestStatus =
    | "draft"
    | "pending_review"
    | "published"
    | "matched"
    | "in_progress"
    | "fulfilled"
    | "cancelled"
    | "expired"
    | "unfulfilled"

const statusConfig: Record<
    RequestStatus,
    { label: string; className: string }
> = {
    draft: {
        label: "Draft",
        className: "bg-muted text-muted-foreground border-border",
    },
    pending_review: {
        label: "Pending Review",
        // Amber — awaiting admin action
        className:
            "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    },
    published: {
        label: "Published",
        className:
            "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    },
    matched: {
        label: "Matched",
        className:
            "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800",
    },
    in_progress: {
        label: "In Progress",
        className:
            "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800",
    },
    fulfilled: {
        label: "Fulfilled",
        // Green — success
        className:
            "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
    },
    cancelled: {
        label: "Cancelled",
        className: "bg-muted text-muted-foreground border-border",
    },
    expired: {
        label: "Expired",
        className: "bg-muted text-muted-foreground border-border",
    },
    unfulfilled: {
        label: "Unfulfilled",
        className:
            "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
    },
}

interface RequestStatusBadgeProps {
    status: RequestStatus | string
    className?: string
}

export function RequestStatusBadge({
    status,
    className,
}: RequestStatusBadgeProps) {
    const config =
        statusConfig[status as RequestStatus] ?? {
            label: status,
            className: "bg-muted text-muted-foreground border-border",
        }

    return (
        <Badge
            variant="outline"
            className={cn("font-medium", config.className, className)}
        >
            {config.label}
        </Badge>
    )
}
