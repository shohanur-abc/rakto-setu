"use client"

import { RiArrowLeftLine, RiBuilding2Line, RiCalendarLine, RiUserLine, RiErrorWarningLine, RiShieldLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import Link from "next/link"

import type { Locale, T } from "@workspace/i18n"
import { useRequestsGetPublic } from "api-client/src/requests"
import { BloodGroupBadge } from "@/components/blood-group-badge"
import { UrgencyBadge } from "@/components/urgency-badge"
import { StatusBadge } from "@/components/status-badge"
import { Container } from "@/components/container"

interface RequestDetailClientProps {
    lang: Locale
    id: string
    t: T["requests"]
    urgency: T["urgency"]
    status: T["status"]
}

export function RequestDetailClient({ lang, id, t, urgency, status }: RequestDetailClientProps) {
    const q = useRequestsGetPublic(id)
    const r = q.data
    const error = q.error

    return (
        <Container className="py-8 @2xl:py-12">
            <Button asChild variant="ghost" size="sm" className="mb-6">
                <Link href={`/${lang}/requests`}>
                    <RiArrowLeftLine className="size-4" aria-hidden="true" />
                    {t.detail.back}
                </Link>
            </Button>

            {error ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-10 text-center">
                    <RiErrorWarningLine className="size-10 text-destructive" aria-hidden="true" />
                    <p className="text-lg font-semibold text-foreground">{t.detail.notFoundTitle}</p>
                    <p className="max-w-sm text-sm text-muted-foreground">{t.detail.notFoundDesc}</p>
                </div>
            ) : q.isLoading || !r ? (
                <Skeleton className="h-96 rounded-xl" />
            ) : (
                <div className="grid gap-6 @2xl:grid-cols-[1fr_320px]">
                    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <BloodGroupBadge group={r.bloodGroup} size="lg" />
                            <UrgencyBadge
                                urgency={r.urgency}
                                label={(urgency as Record<string, string>)[r.urgency] ?? r.urgency}
                            />
                            <StatusBadge
                                status={r.status}
                                label={(status as Record<string, string>)[r.status] ?? r.status}
                            />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground @2xl:text-3xl">{r.patientName}</h1>
                        <dl className="grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm @2xl:grid-cols-3">
                            <Field label={t.detail.age} value={r.patientAge != null ? String(r.patientAge) : "—"} />
                            <Field label={t.detail.units} value={String(r.unitsNeeded)} />
                            <Field label={t.detail.fulfilled} value={String(r.unitsFulfilled)} />
                        </dl>
                        <dl className="grid grid-cols-1 gap-4 border-t border-border pt-4 text-sm @2xl:grid-cols-2">
                            <Field icon={RiBuilding2Line} label={t.detail.hospital} value={r.hospitalName} />
                            <Field icon={RiCalendarLine} label={t.detail.neededBy} value={fmt(r.neededBy, lang)} />
                            <Field icon={RiUserLine} label={t.detail.location} value={r.location?.name ?? "—"} />
                            <Field icon={RiCalendarLine} label={t.detail.postedOn} value={fmt(r.createdAt, lang)} />
                        </dl>
                        {r.notes && (
                            <div className="border-t border-border pt-4">
                                <p className="mb-1 text-xs font-medium text-muted-foreground uppercase">{t.detail.notes}</p>
                                <p className="text-sm leading-relaxed text-foreground">{r.notes}</p>
                            </div>
                        )}
                    </div>

                    <aside className="flex flex-col gap-4">
                        <div className="rounded-xl border border-border bg-card p-5">
                            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <RiShieldLine className="size-4 text-primary" aria-hidden="true" />
                                {t.detail.status}
                            </p>
                            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                {t.detail.contactLocked}
                            </p>
                        </div>
                    </aside>
                </div>
            )}
        </Container>
    )
}

function Field({ icon: Icon, label, value }: { icon?: typeof RiUserLine; label: string; value: string }) {
    return (
        <div>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 flex items-center gap-1.5 font-medium text-foreground">
                {Icon && <Icon className="size-3.5 text-muted-foreground" aria-hidden="true" />}
                {value}
            </dd>
        </div>
    )
}

function fmt(iso: unknown, lang: Locale) {
    try {
        return new Intl.DateTimeFormat(lang === "bn" ? "bn-BD" : "en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(iso as string))
    } catch {
        return String(iso)
    }
}
