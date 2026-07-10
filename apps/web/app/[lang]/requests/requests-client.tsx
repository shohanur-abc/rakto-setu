"use client"

import { RiBuilding2Line, RiCalendarLine, RiErrorWarningLine, RiInboxLine, RiArrowRightLine, RiHeartPulseLine } from "@remixicon/react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import Link from "next/link"

import type { Locale, T } from "@workspace/i18n"
import { useRequestsListPublic } from "api-client/src/requests"
import { BloodGroupBadge } from "@/components/blood-group-badge"
import { UrgencyBadge } from "@/components/urgency-badge"
import { PageHeader } from "@/components/page-header"
import { Container } from "@/components/container"

interface RequestsClientProps {
    lang: Locale
    t: T["requests"]
    urgency: T["urgency"]
}

export function RequestsClient({ lang, t, urgency }: RequestsClientProps) {
    const q = useRequestsListPublic({ page: 1, limit: 24 })
    const data = q.data
    const items = data?.items ?? []
    const error = q.error

    return (
        <>
            <PageHeader eyebrow={t.title} title={t.title} subtitle={t.subtitle} />
            <Container className="py-10 @2xl:py-12">
                {error ? (
                    <div className="flex items-center gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">
                        <RiErrorWarningLine className="size-5 shrink-0" />
                        <span>{error.messages?.[0] ?? t.states.error}</span>
                    </div>
                ) : q.isLoading ? (
                    <div className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <Skeleton key={i} className="h-44 rounded-xl" />
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-background/60 py-16 text-center">
                        <RiInboxLine className="size-10 text-muted-foreground" aria-hidden="true" />
                        <p className="text-base font-medium text-foreground">{t.empty.title}</p>
                        <p className="max-w-sm text-sm text-muted-foreground">{t.empty.desc}</p>
                    </div>
                ) : (
                    <>
                        <p className="mb-4 text-sm text-muted-foreground">
                            {t.list.count.replace("{count}", String(data?.meta?.total ?? items.length))}
                        </p>
                        <div className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
                            {items.map((r) => (
                                <Link
                                    key={r.id}
                                    href={`/${lang}/requests/${r.id}`}
                                    className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-sm"
                                >
                                    <div className="flex items-center justify-between">
                                        <BloodGroupBadge group={r.bloodGroup} size="lg" />
                                        <UrgencyBadge
                                            urgency={r.urgency}
                                            label={(urgency as Record<string, string>)[r.urgency] ?? r.urgency}
                                        />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">{r.patientName}</p>
                                        <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                                            <RiHeartPulseLine className="size-3.5" aria-hidden="true" />
                                            {t.list.unitsNeeded.replace("{count}", String(r.unitsNeeded))}
                                        </p>
                                    </div>
                                    <div className="mt-auto flex flex-col gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1.5">
                                            <RiBuilding2Line className="size-3.5" aria-hidden="true" />
                                            {r.hospitalName}
                                        </span>
                                        <span className="flex items-center justify-between">
                                            <span className="flex items-center gap-1.5">
                                                <RiCalendarLine className="size-3.5" aria-hidden="true" />
                                                {t.list.neededBy}: {fmt(r.neededBy, lang)}
                                            </span>
                                            <RiArrowRightLine className="size-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </Container>
        </>
    )
}

function fmt(iso: unknown, lang: Locale) {
    try {
        return new Intl.DateTimeFormat(lang === "bn" ? "bn-BD" : "en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(new Date(iso as string))
    } catch {
        return String(iso)
    }
}
