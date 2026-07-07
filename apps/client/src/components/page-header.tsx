import type { ReactNode } from "react"

interface PageHeaderProps {
    title: string
    description?: string
    /** Right-aligned actions (buttons, links). */
    actions?: ReactNode
}

/** Compact header for in-app (dashboard) pages — distinct from the marketing
 * `Section` header used on public pages. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
    return (
        <div className="mb-6 flex flex-col gap-3 border-b border-border pb-5 @2xl:flex-row @2xl:items-end @2xl:justify-between">
            <div className="space-y-1">
                <h1 className="font-heading text-2xl font-bold tracking-tight @2xl:text-3xl">
                    {title}
                </h1>
                {description && (
                    <p className="max-w-2xl text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
    )
}
