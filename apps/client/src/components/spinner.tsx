import { RiLoader4Line } from "@remixicon/react"
import { cn } from "@workspace/ui/lib/utils"

// Local spinner. We intentionally avoid `@workspace/ui/components/spinner`,
// whose prop typings clash with the installed React/@remixicon versions; a
// direct icon usage (as the rest of the app already does) is type-clean.
export function Spinner({ className }: { className?: string }) {
    return (
        <RiLoader4Line
            className={cn("size-4 animate-spin", className)}
            aria-hidden
        />
    )
}
