"use client"

import { RiQuestionLine, RiErrorWarningLine } from "@remixicon/react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@workspace/ui/components/accordion"
import { Skeleton } from "@workspace/ui/components/skeleton"

import type { Locale, T } from "@workspace/i18n"
import { useInfoFaqs } from "api-client/src/info"
import { PageHeader } from "@/components/page-header"
import { Container } from "@/components/container"
import { InfoTabs } from "../info-tabs"

export function FaqsClient({ lang, t }: { lang: Locale; t: T["info"] }) {
    const q = useInfoFaqs()
    const items = q.data ?? []
    const error = q.error

    return (
        <>
            <PageHeader eyebrow={t.nav.faqs} title={t.faqs.title} subtitle={t.faqs.subtitle} />
            <Container className="py-10 @2xl:py-12">
                <InfoTabs lang={lang} active="faqs" nav={t.nav} />
                <div className="mx-auto mt-8 max-w-2xl">
                    {error ? (
                        <div className="flex items-center gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">
                            <RiErrorWarningLine className="size-5 shrink-0" />
                            <span>{error.messages?.[0] ?? t.faqs.subtitle}</span>
                        </div>
                    ) : q.isLoading ? (
                        <div className="flex flex-col gap-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-14 rounded-xl" />
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground">{t.faqs.empty}</p>
                    ) : (
                        <Accordion type="single" collapsible>
                            {items.map((f, i) => (
                                <AccordionItem key={i} value={`item-${i}`}>
                                    <AccordionTrigger className="text-left hover:no-underline">
                                        <span className="flex items-center gap-2">
                                            <RiQuestionLine className="size-4 shrink-0 text-primary" aria-hidden="true" />
                                            {f.question}
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                                        {f.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )}
                </div>
            </Container>
        </>
    )
}
