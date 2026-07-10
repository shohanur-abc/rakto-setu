import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

export const BLOOD_GROUPS = [
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
] as const

export type BloodGroup = (typeof BLOOD_GROUPS)[number]

const groupStyles: Record<BloodGroup, string> = {
    "O-": "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
    "O+": "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    "A-": "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20",
    "A+": "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    "B-": "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20",
    "B+": "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    "AB-": "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
    "AB+": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
}

export function BloodGroupBadge({
    group,
    className,
    size = "default",
    children,
}: {
    group: string
    className?: string
    size?: "default" | "lg"
    children?: React.ReactNode
}) {
    const g = (BLOOD_GROUPS as readonly string[]).includes(group)
        ? (group as BloodGroup)
        : "O-"
    return (
        <Badge
            variant="outline"
            className={cn(
                "border font-bold tabular-nums",
                groupStyles[g],
                size === "lg" && "h-7 px-2.5 text-sm",
                className,
            )}
        >
            {group}
            {children}
        </Badge>
    )
}
