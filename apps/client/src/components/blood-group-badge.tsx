import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

const bloodGroupConfig: Record<
    string,
    { label: string; className: string }
> = {
    "A+": {
        label: "A+",
        className:
            "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
    },
    "A-": {
        label: "A−",
        className:
            "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
    },
    "B+": {
        label: "B+",
        className:
            "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    },
    "B-": {
        label: "B−",
        className:
            "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    },
    "AB+": {
        label: "AB+",
        className:
            "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
    },
    "AB-": {
        label: "AB−",
        className:
            "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
    },
    "O+": {
        label: "O+",
        className:
            "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
    },
    "O-": {
        label: "O−",
        className:
            "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
    },
}

interface BloodGroupBadgeProps {
    bloodGroup: string
    className?: string
    size?: "sm" | "default" | "lg"
}

export function BloodGroupBadge({
    bloodGroup,
    className,
    size = "default",
}: BloodGroupBadgeProps) {
    const config = bloodGroupConfig[bloodGroup] ?? {
        label: bloodGroup,
        className:
            "bg-muted text-muted-foreground border-border",
    }

    return (
        <Badge
            variant="outline"
            className={cn(
                "font-bold tracking-wide",
                size === "sm" && "text-xs px-1.5 py-0",
                size === "lg" && "text-base px-3 py-1",
                config.className,
                className
            )}
        >
            {config.label}
        </Badge>
    )
}
