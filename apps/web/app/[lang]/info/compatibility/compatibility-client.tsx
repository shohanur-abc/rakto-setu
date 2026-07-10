"use client"

import { RiErrorWarningLine } from "@remixicon/react"
import { Skeleton } from "@workspace/ui/components/skeleton"

import type { Locale, T } from "@workspace/i18n"
import { useInfoCompatibility } from "api-client/src/info"
import { BloodGroupBadge, BLOOD_GROUPS } from "@/components/blood-group-badge"
import { PageHeader } from "@/components/page-header"
import { Container } from "@/components/container"
import { InfoTabs } from "../info-tabs"

export function CompatibilityClient({ lang, t }: { lang: Locale; t: T["info"] }) {
    const q = useInfoCompatibility()
    const map = q.data ?? {}
    const error = q.error

    return (
        <>
            <PageHeader eyebrow={t.nav.compatibility} title={t.compatibility.title} subtitle={t.compatibility.subtitle} />
            <Container className="py-10 @2xl:py-12">
                <InfoTabs lang={lang} active="compatibility" nav={t.nav} />
                <div className="mt-8">
                    {error ? (
                        <div className="flex items-center gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">
                            <RiErrorWarningLine className="size-5 shrink-0" />
                            <span>{error.messages?.[0] ?? t.compatibility.subtitle}</span>
                        </div>
                    ) : q.isLoading ? (
                        <Skeleton className="h-96 rounded-xl" />
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-border">
                            <div className="grid grid-cols-[120px_1fr] border-b border-border bg-card px-4 py-3 text-xs font-semibold text-muted-foreground">
                                <div>{t.compatibility.donor}</div>
                                <div>{t.compatibility.recipient}</div>
                            </div>
                            {BLOOD_GROUPS.map((g) => {
                                const recipients = map[g] ?? []
                                return (
                                    <div key={g} className="grid grid-cols-[120px_1fr] items-center gap-3 border-b border-border px-4 py-3 last:border-0">
                                        <BloodGroupBadge group={g} size="lg" />
                                        <div className="flex flex-wrap gap-1.5">
                                            {recipients.map((r) => (
                                                <BloodGroupBadge key={r} group={r} />
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </Container>
        </>
    )
}
