"use client"

import { RiShieldLine } from "@remixicon/react"
import { Badge } from "@workspace/ui/components/badge"
import { useAdminModerationQueue } from "api-client/src/admin"
import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { EmptyState, ErrorState, JsonPanel, LoadingRows } from "@/components/api-surface"
import { AdminTabs } from "../admin-tabs"

export function AdminModerationClient({ lang }: { lang: string }) {
    const moderation = useAdminModerationQueue()
    const entries = toEntries(moderation.data)

    return (
        <>
            <PageHeader eyebrow="Admin" title="Moderation" subtitle="Review reported or flagged content before it affects public trust." />
            <AdminTabs lang={lang} />
            <Container className="space-y-6 py-8 @2xl:py-10">
                <div className="grid gap-3 @2xl:grid-cols-2">
                    <Stat label="Queue groups" value={entries.length} />
                    <Stat label="Requires manual review" value={moderation.data ? 1 : 0} />
                </div>
                <section className="rounded-lg border border-border bg-card p-5">
                    <div className="mb-4 flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                            <RiShieldLine className="size-5" aria-hidden="true" />
                        </span>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Moderation queue</h2>
                            <p className="text-sm text-muted-foreground">The endpoint shape is flexible, so each queue group is shown as a readable inspection block.</p>
                        </div>
                    </div>
                    {moderation.error ? <ErrorState error={moderation.error} /> : moderation.isLoading ? <LoadingRows rows={3} /> : entries.length ? (
                        <div className="space-y-3">
                            {entries.map(([key, value]) => (
                                <div key={key} className="rounded-lg border border-border bg-background p-4">
                                    <div className="mb-2 flex items-center gap-2">
                                        <Badge variant="outline">{key}</Badge>
                                    </div>
                                    <JsonPanel value={value} />
                                </div>
                            ))}
                        </div>
                    ) : <EmptyState>No moderation items are waiting.</EmptyState>}
                </section>
            </Container>
        </>
    )
}

function toEntries(value: unknown): Array<[string, unknown]> {
    if (!value || typeof value !== "object") return []
    return Object.entries(value as Record<string, unknown>)
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
        </div>
    )
}
