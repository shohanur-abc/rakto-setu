"use client"

import { RiHeartPulseLine, RiErrorWarningLine } from "@remixicon/react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"

import type { Locale, T } from "@workspace/i18n"
import { useSearchAvailabilitySummary } from "api-client/src/search"
import { BloodGroupBadge } from "@/components/blood-group-badge"
import { Section } from "@/components/section"

interface AvailabilityProps {
    lang: Locale
    t: T["home"]["availability"]
}

export function Availability({ lang, t }: AvailabilityProps) {
    const { data, isLoading, error } = useSearchAvailabilitySummary()

    const summary = data ?? []
    const max = summary.reduce((m, g) => Math.max(m, g.availableDonors ?? 0), 0) || 1

    return (
        <Section eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle}>
            {error ? (
                <div className="flex items-center gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">
                    <RiErrorWarningLine className="size-5 shrink-0" />
                    <span>{error.messages?.[0] ?? t.subtitle}</span>
                </div>
            ) : isLoading ? (
                <div className="grid gap-3 @2xl:grid-cols-2 @5xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="grid gap-3 @2xl:grid-cols-2 @5xl:grid-cols-4">
                    {summary.map((g) => (
                        <div
                            key={g.bloodGroup}
                            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
                        >
                            <div className="flex items-center justify-between">
                                <BloodGroupBadge group={g.bloodGroup} size="lg" />
                                <span className="text-2xl font-bold tabular-nums text-foreground">
                                    {g.availableDonors}
                                </span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                                <div
                                    className="h-full rounded-full bg-primary transition-all"
                                    style={{ width: `${(g.availableDonors / max) * 100}%` }}
                                />
                            </div>
                            <span className="text-xs text-muted-foreground">{t.available}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-8 flex justify-center">
                <Button asChild variant="outline">
                    <Link href={`/${lang}/donors`}>
                        <RiHeartPulseLine className="size-4" aria-hidden="true" />
                        {t.available}
                    </Link>
                </Button>
            </div>
        </Section>
    )
}
