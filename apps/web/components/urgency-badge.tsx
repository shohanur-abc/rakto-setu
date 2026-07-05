import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { RiAlarmWarningLine, RiAlertLine, RiCalendarLine } from "@remixicon/react"
import type { RemixiconComponentType } from "@remixicon/react"

type Urgency = "routine" | "urgent" | "emergency"

const urgencyConfig: Record<
    Urgency,
    { label: string; className: string; Icon: RemixiconComponentType }
> = {
    routine: {
        label: "Routine",
        Icon: RiCalendarLine,
        className:
            "bg-secondary text-secondary-foreground border-border",
    },
    urgent: {
        label: "Urgent",
        Icon: RiAlertLine,
        // Amber — medically meaningful, must not follow theme
        className:
            "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    },
    emergency: {
        label: "Emergency",
        Icon: RiAlarmWarningLine,
        // Red — medically meaningful
        className:
            "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
    },
}

interface UrgencyBadgeProps {
    urgency: Urgency | string
    className?: string
    showIcon?: boolean
}

export function UrgencyBadge({
    urgency,
    className,
    showIcon = true,
}: UrgencyBadgeProps) {
    const config =
        urgencyConfig[urgency as Urgency] ?? urgencyConfig.routine
    const Icon = config.Icon

    return (
        <Badge
            variant="outline"
            className={cn(
                "inline-flex items-center gap-1 font-medium",
                config.className,
                className
            )}
        >
            {showIcon && <Icon className="size-3" />}
            {config.label}
        </Badge>
    )
}
