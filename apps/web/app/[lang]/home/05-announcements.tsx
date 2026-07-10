"use client"

import { RiArrowRightLine, RiErrorWarningLine, RiMegaphoneLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import Link from "next/link"

import type { Locale, T } from "@workspace/i18n"
import { useAnnouncementsListPublic } from "api-client/src/announcements"
import { Section } from "@/components/section"

interface AnnouncementsProps {
    lang: Locale
    t: T["home"]["announcements"]
    common: T["common"]
}

export function Announcements({ lang, t, common }: AnnouncementsProps) {
    const { data, isLoading, error } = useAnnouncementsListPublic()
    const items = (data ?? []).slice(0, 3)

    return (
        <Section
            eyebrow={t.eyebrow}
            title={t.title}
            subtitle={t.subtitle}
            actions={
                <Button asChild variant="ghost" size="sm">
                    <Link href={`/${lang}/announcements`}>
                        {common.seeAll}
                        <RiArrowRightLine className="size-4" aria-hidden="true" />
                    </Link>
                </Button>
            }
            className="bg-card/30"
        >
            {error ? (
                <div className="flex items-center gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">
                    <RiErrorWarningLine className="size-5 shrink-0" />
                    <span>{error.messages?.[0] ?? t.subtitle}</span>
                </div>
            ) : isLoading ? (
                <div className="grid gap-4 @2xl:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-40 rounded-xl" />
                    ))}
                </div>
            ) : items.length === 0 ? null : (
                <div className="grid gap-4 @2xl:grid-cols-3">
                    {items.map((a) => (
                        <article
                            key={a.id}
                            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
                        >
                            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <RiMegaphoneLine className="size-5" aria-hidden="true" />
                            </span>
                            <h3 className="font-semibold text-foreground">{a.title}</h3>
                            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                                {a.body}
                            </p>
                            <time className="mt-auto text-xs text-muted-foreground">
                                {formatDate(a.createdAt, lang)}
                            </time>
                        </article>
                    ))}
                </div>
            )}
        </Section>
    )
}

function formatDate(iso: unknown, lang: Locale) {
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
