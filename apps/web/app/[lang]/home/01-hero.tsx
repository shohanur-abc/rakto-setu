"use client"

import {
    RiArrowRightLine,
    RiHeartPulseLine,
    RiMapPin2Line,
    RiShieldCheckLine,
} from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"

import type { Locale, T } from "@workspace/i18n"
import { useSearchAvailabilitySummary } from "api-client/src/search"
import { useRequestsListPublic } from "api-client/src/requests"
import { Container } from "@/components/container"
import { BloodGroupBadge } from "@/components/blood-group-badge"

type HeroT = T["home"]["hero"]

interface HeroProps {
    lang: Locale
    t: HeroT
    cta: { request: string; find: string }
}

/**
 * Hero — Client Component because it fetches live availability + open-request
 * counts via the generated TanStack Query hooks to power the stat strip.
 */
export function Hero({ lang, t, cta }: HeroProps) {
    const availability = useSearchAvailabilitySummary()
    const requests = useRequestsListPublic({ page: 1, limit: 1 })
    const totalDonors =
        (availability.data ?? []).reduce((sum, g) => sum + (g.availableDonors ?? 0), 0) || 0
    const openRequests = requests.data?.meta?.total ?? 0

    const stats = [
        { icon: RiHeartPulseLine, label: t.statDonors, value: totalDonors },
        { icon: RiHeartPulseLine, label: t.statRequests, value: openRequests },
        { icon: RiMapPin2Line, label: t.statGroups, value: 8 },
        { icon: RiShieldCheckLine, label: t.statVerified, value: "✓" },
    ]

    return (
        <section className="@container relative overflow-hidden border-b border-border bg-background">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
                    backgroundSize: "32px 32px",
                }}
            />
            <Container className="relative">
                <div className="grid items-center gap-10 py-14 @2xl:grid-cols-[1.1fr_0.9fr] @5xl:py-20">
                    <div className="max-w-2xl">
                        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
                            <RiHeartPulseLine className="size-4" aria-hidden="true" />
                            {t.badge}
                        </span>
                        <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground @2xl:text-5xl @5xl:text-6xl">
                            {t.title}
                        </h1>
                        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground @2xl:text-lg">
                            {t.subtitle}
                        </p>
                        <div className="mt-8 flex flex-col gap-3 @2xl:flex-row">
                            <Button asChild size="lg" className="h-11">
                                <Link href={`/${lang}/donors`}>
                                    {cta.find}
                                    <RiArrowRightLine className="size-4" aria-hidden="true" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="h-11">
                                <Link href={`/${lang}/requests/new`}>{cta.request}</Link>
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 @2xl:gap-4">
                        {stats.map((s) => {
                            const Icon = s.icon
                            return (
                                <div
                                    key={s.label}
                                    className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 @2xl:p-5"
                                >
                                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Icon className="size-5" aria-hidden="true" />
                                    </span>
                                    <span className="text-2xl font-bold tabular-nums text-foreground @2xl:text-3xl">
                                        {s.value}
                                    </span>
                                    <span className="text-xs text-muted-foreground @2xl:text-sm">{s.label}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {availability.data && availability.data.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 border-t border-border py-5">
                        <span className="mr-2 text-xs font-medium text-muted-foreground uppercase">
                            {t.statDonors}:
                        </span>
                        {availability.data.map((g) => (
                            <BloodGroupBadge key={g.bloodGroup} group={g.bloodGroup} className="gap-1.5">
                                <span className="tabular-nums opacity-70">{g.availableDonors}</span>
                            </BloodGroupBadge>
                        ))}
                    </div>
                )}
            </Container>
        </section>
    )
}
