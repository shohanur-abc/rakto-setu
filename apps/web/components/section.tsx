import { cn } from "@workspace/ui/lib/utils"
import { Container } from "./container"

interface SectionProps {
    id?: string
    /** Small label above the title (e.g. "Live Availability"). */
    eyebrow?: string
    /** The heading. */
    title?: string
    /** A short line under the title. */
    subtitle?: string
    /** Longer paragraph of body copy. */
    description?: string
    /** Right-aligned action area (links, buttons). */
    actions?: React.ReactNode
    /** Heading alignment. */
    align?: "left" | "center"
    /** Vertical padding scale. */
    spacing?: "default" | "tight" | "none"
    /** Extra classes on the outer <section>. */
    className?: string
    /** Extra classes on the inner Container. */
    containerClassName?: string
    children?: React.ReactNode
}

const spacingMap = {
    none: "",
    tight: "py-10 @5xl:py-14",
    default: "py-16 @5xl:py-24",
} as const

/**
 * Presentational page section with a composable heading
 * (eyebrow / title / subtitle / description / actions) and a body.
 * Uses container queries only — no viewport breakpoints.
 */
export function Section({
    id,
    eyebrow,
    title,
    subtitle,
    description,
    actions,
    align = "left",
    spacing = "default",
    className,
    containerClassName,
    children,
}: SectionProps) {
    const hasHeading = eyebrow || title || subtitle || description || actions

    return (
        <section id={id} className={cn("@container relative", spacingMap[spacing], className)}>
            <Container className={containerClassName}>
                {hasHeading && (
                    <div
                        className={cn(
                            "mb-10 flex flex-col gap-4 @2xl:mb-12 @2xl:flex-row @2xl:items-end @2xl:justify-between",
                            align === "center" && "@2xl:items-center @2xl:text-center",
                        )}
                    >
                        <div className={cn("flex max-w-3xl flex-col gap-3", align === "center" && "mx-auto items-center text-center")}>
                            {eyebrow && (
                                <span className="text-sm font-semibold tracking-wide text-primary uppercase">
                                    {eyebrow}
                                </span>
                            )}
                            {title && (
                                <h2 className="text-3xl font-bold tracking-tight text-foreground @2xl:text-4xl">
                                    {title}
                                </h2>
                            )}
                            {subtitle && (
                                <p className="text-base font-medium text-foreground/80 @2xl:text-lg">
                                    {subtitle}
                                </p>
                            )}
                            {description && (
                                <p className="text-base leading-relaxed text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>
                        {actions && (
                            <div className={cn("flex shrink-0 items-center gap-2", align === "center" && "justify-center")}>
                                {actions}
                            </div>
                        )}
                    </div>
                )}
                {children}
            </Container>
        </section>
    )
}
