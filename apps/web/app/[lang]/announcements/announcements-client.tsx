"use client"

import { RiMegaphoneLine, RiErrorWarningLine, RiInboxLine } from "@remixicon/react"
import { Skeleton } from "@workspace/ui/components/skeleton"

import type { Locale, T } from "@workspace/i18n"
import { useAnnouncementsListPublic } from "api-client/src/announcements"
import { PageHeader } from "@/components/page-header"
import { Container } from "@/components/container"

export function AnnouncementsClient({ lang, t }: { lang: Locale; t: T["announcements"] }) {
    const q = useAnnouncementsListPublic()
    const items = q.data ?? []
    const error = q.error

    return (
        <>
            <PageHeader eyebrow={t.title} title={t.title} subtitle={t.subtitle} />
            <Container className="py-10 @2xl:py-12">
                {error ? (
                    <div className="flex items-center gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">
                        <RiErrorWarningLine className="size-5 shrink-0" />
                        <span>{error.messages?.[0] ?? t.subtitle}</span>
                    </div>
                ) : q.isLoading ? (
                    <div className="grid gap-4 @2xl:grid-cols-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-40 rounded-xl" />
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-background/60 py-16 text-center">
                        <RiInboxLine className="size-10 text-muted-foreground" aria-hidden="true" />
                        <p className="text-sm text-muted-foreground">{t.empty}</p>
                    </div>
                ) : (
                    <div className="grid gap-4 @2xl:grid-cols-2">
                        {items.map((a) => (
                            <article key={a.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
                                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <RiMegaphoneLine className="size-5" aria-hidden="true" />
                                </span>
                                <h2 className="text-lg font-semibold text-foreground">{a.title}</h2>
                                <p className="text-sm leading-relaxed text-muted-foreground">{a.body}</p>
                                <time className="mt-auto text-xs text-muted-foreground">
                                    {t.postedOn}: {fmt(a.createdAt, lang)}
                                </time>
                            </article>
                        ))}
                    </div>
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
