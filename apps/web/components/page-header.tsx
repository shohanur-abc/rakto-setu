import { cn } from "@workspace/ui/lib/utils"
import { Container } from "./container"

interface PageHeaderProps {
    eyebrow?: string
    title: string
    subtitle?: string
    description?: string
    actions?: React.ReactNode
    className?: string
}

/**
 * Top-of-page header for inner pages (Donors, Requests, Info, …).
 * Distinct from `Section` — no vertical padding bloat, sits at page top.
 */
export function PageHeader({
    eyebrow,
    title,
    subtitle,
    description,
    actions,
    className,
}: PageHeaderProps) {
    return (
        <header className={cn("border-b border-border bg-card/40", className)}>
            <Container className="py-12 @2xl:py-16">
                <div className="flex flex-col gap-4 @2xl:flex-row @2xl:items-end @2xl:justify-between">
                    <div className="flex max-w-3xl flex-col gap-2">
                        {eyebrow && (
                            <span className="text-sm font-semibold tracking-wide text-primary uppercase">
                                {eyebrow}
                            </span>
                        )}
                        <h1 className="text-3xl font-bold tracking-tight text-foreground @2xl:text-4xl">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-base font-medium text-foreground/80 @2xl:text-lg">
                                {subtitle}
                            </p>
                        )}
                        {description && (
                            <p className="mt-1 text-base leading-relaxed text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>
                    {actions && (
                        <div className="flex shrink-0 items-center gap-2">{actions}</div>
                    )}
                </div>
            </Container>
        </header>
    )
}
