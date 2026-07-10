"use client"

import { RiQuestionLine, RiErrorWarningLine } from "@remixicon/react"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@workspace/ui/components/accordion"
import { Skeleton } from "@workspace/ui/components/skeleton"

import type { T } from "@workspace/i18n"
import { useInfoFaqs } from "api-client/src/info"
import { Section } from "@/components/section"

interface FaqProps {
    t: T["home"]["faq"]
}

export function Faq({ t }: FaqProps) {
    const { data, isLoading, error } = useInfoFaqs()
    const items = (data ?? []).slice(0, 6)

    return (
        <Section eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} align="center">
            {error ? (
                <div className="mx-auto flex max-w-2xl items-center gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">
                    <RiErrorWarningLine className="size-5 shrink-0" />
                    <span>{error.messages?.[0] ?? t.subtitle}</span>
                </div>
            ) : isLoading ? (
                <div className="mx-auto flex max-w-2xl flex-col gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-14 rounded-xl" />
                    ))}
                </div>
            ) : items.length === 0 ? null : (
                <Accordion type="single" collapsible className="mx-auto max-w-2xl">
                    {items.map((f, i) => (
                        <AccordionItem key={i} value={`item-${i}`}>
                            <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
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
        </Section>
    )
}
