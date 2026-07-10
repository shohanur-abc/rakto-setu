import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

export type Urgency = "routine" | "urgent" | "emergency"

const urgencyStyles: Record<Urgency, string> = {
    routine: "bg-secondary text-secondary-foreground border-border",
    urgent: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25",
    emergency: "bg-destructive/15 text-destructive border-destructive/25 animate-pulse",
}

export function UrgencyBadge({
    urgency,
    label,
    className,
}: {
    urgency: string
    label: string
    className?: string
}) {
    const u = (["routine", "urgent", "emergency"] as const).includes(urgency as Urgency)
        ? (urgency as Urgency)
        : "routine"
    return (
        <Badge
            variant="outline"
            className={cn("border font-medium capitalize", urgencyStyles[u], className)}
        >
            {label}
        </Badge>
    )
}
