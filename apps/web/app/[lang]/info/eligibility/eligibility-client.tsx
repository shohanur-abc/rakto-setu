"use client"

import { RiCalendarLine, RiUserLine, RiErrorWarningLine, RiInformationLine } from "@remixicon/react"
import { Skeleton } from "@workspace/ui/components/skeleton"

import type { Locale, T } from "@workspace/i18n"
import { useInfoEligibility } from "api-client/src/info"
import { PageHeader } from "@/components/page-header"
import { Container } from "@/components/container"
import { InfoTabs } from "../info-tabs"

export function EligibilityClient({ lang, t }: { lang: Locale; t: T["info"] }) {
    const q = useInfoEligibility()
    const data = q.data
    const error = q.error

    return (
        <>
            <PageHeader eyebrow={t.nav.eligibility} title={t.eligibility.title} subtitle={t.eligibility.subtitle} />
            <Container className="py-10 @2xl:py-12">
                <InfoTabs lang={lang} active="eligibility" nav={t.nav} />
                <div className="mx-auto mt-8 max-w-2xl">
                    {error ? (
                        <div className="flex items-center gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">
                            <RiErrorWarningLine className="size-5 shrink-0" />
                            <span>{error.messages?.[0] ?? t.eligibility.subtitle}</span>
                        </div>
                    ) : q.isLoading ? (
                        <Skeleton className="h-48 rounded-xl" />
                    ) : (
                        <div className="grid gap-4 @2xl:grid-cols-2">
                            <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
                                <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <RiUserLine className="size-6" aria-hidden="true" />
                                </span>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{data?.minimumAge ?? 18} {t.eligibility.years}</p>
                                    <p className="text-sm text-muted-foreground">{t.eligibility.minimumAge}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
                                <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <RiCalendarLine className="size-6" aria-hidden="true" />
                                </span>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{data?.generalCooldownDays ?? 90} {t.eligibility.days}</p>
                                    <p className="text-sm text-muted-foreground">{t.eligibility.cooldown}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {data?.note && (
                        <div className="mt-4 flex gap-3 rounded-xl border border-border bg-secondary/50 p-4">
                            <RiInformationLine className="size-5 shrink-0 text-primary" aria-hidden="true" />
                            <div>
                                <p className="text-xs font-semibold text-foreground">{t.eligibility.note}</p>
                                <p className="mt-1 text-sm text-muted-foreground">{data.note}</p>
                            </div>
                        </div>
                    )}
                </div>
            </Container>
        </>
    )
}
