import { cn } from "@workspace/ui/lib/utils"

export function Section({
    id,
    eyebrow,
    title,
    description,
    align = "center",
    cols,
    decorative,
    className,
    containerClass,
    classNames,
    children,
}: SectionProps) {
    const alignClasses = {
        center: "items-center text-center",
        left: "items-start text-left",
        right: "items-end text-right",
    }

    const gridClasses = cols
        ? {
            2: "grid grid-cols-1 @2xl:grid-cols-2 gap-6",
            3: "grid grid-cols-1 @2xl:grid-cols-2 @5xl:grid-cols-3 gap-6",
            4: "grid grid-cols-1 @2xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-6",
        }[cols]
        : null

    return (
        <section id={id} className={cn("@container isolate relative overflow-hidden", classNames?.outerContainer, className)}>
            <div className={cn("mx-auto max-w-7xl px-4 py-16 @2xl:px-6 @5xl:py-24", classNames?.innerContainer, containerClass)}>
                {(eyebrow || title || description) && (
                    <div className={cn("mx-auto mb-12 flex max-w-3xl flex-col gap-4", alignClasses[align], classNames?.headingContainer)}>
                        {eyebrow && (
                            <div
                                className={cn(
                                    "inline-flex items-center gap-2 text-sm font-medium tracking-wide text-primary uppercase",
                                    classNames?.eyebrow,
                                )}
                            >
                                {eyebrow.icon && <span className="[&_svg]:size-4">{eyebrow.icon}</span>}
                                <span>{eyebrow.text}</span>
                            </div>
                        )}
                        {title && (
                            <h2 className={cn("font-heading text-3xl font-bold tracking-tight @5xl:text-4xl", classNames?.title)}>
                                {title}
                            </h2>
                        )}
                        {description && (
                            <p className={cn("text-lg leading-relaxed text-muted-foreground", classNames?.subtitle)}>
                                {description}
                            </p>
                        )}
                    </div>
                )}

                {children && (gridClasses ? <div className={gridClasses}>{children}</div> : children)}
            </div>

            {decorative}
        </section>
    )
}

// ===================== Types =====================

interface SectionProps {
    id?: string
    eyebrow?: { icon?: React.ReactNode; text: string }
    title?: string
    description?: string
    align?: "center" | "left" | "right"
    cols?: 2 | 3 | 4
    decorative?: React.ReactNode
    className?: string
    containerClass?: string
    classNames?: {
        outerContainer?: string
        innerContainer?: string
        headingContainer?: string
        eyebrow?: string
        title?: string
        subtitle?: string
    }
    children?: React.ReactNode
}
