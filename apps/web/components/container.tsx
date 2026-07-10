import { cn } from "@workspace/ui/lib/utils"

/**
 * Centered max-width wrapper. The single source of horizontal padding +
 * max width for every page section.
 */
export function Container({
    className,
    children,
}: {
    className?: string
    children: React.ReactNode
}) {
    return (
        <div className={cn("mx-auto w-full max-w-7xl px-4 @2xl:px-6 @5xl:px-8", className)}>
            {children}
        </div>
    )
}
