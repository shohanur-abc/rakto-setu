import { RiArrowRightLine, RiHandHeartLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"

import type { Locale, T } from "@workspace/i18n"
import { Container } from "@/components/container"

interface CtaProps {
    lang: Locale
    t: T["home"]["cta"]
}

export function Cta({ lang, t }: CtaProps) {
    return (
        <section className="@container border-t border-border bg-primary text-primary-foreground">
            <Container className="flex flex-col items-center gap-6 py-16 text-center @2xl:py-20">
                <h2 className="max-w-2xl text-3xl font-bold tracking-tight @2xl:text-4xl">
                    {t.title}
                </h2>
                <p className="max-w-xl text-base leading-relaxed text-primary-foreground/80 @2xl:text-lg">
                    {t.subtitle}
                </p>
                <div className="flex flex-col gap-3 @2xl:flex-row">
                    <Button asChild variant="secondary" size="lg" className="h-11">
                        <Link href={`/${lang}/register`}>
                            <RiHandHeartLine className="size-4" aria-hidden="true" />
                            {t.becomeDonor}
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="h-11 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                    >
                        <Link href={`/${lang}/requests/new`}>
                            {t.requestBlood}
                            <RiArrowRightLine className="size-4" aria-hidden="true" />
                        </Link>
                    </Button>
                </div>
            </Container>
        </section>
    )
}
