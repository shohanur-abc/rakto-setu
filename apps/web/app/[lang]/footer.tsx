import { RiHeartPulseLine } from "@remixicon/react"
import Link from "next/link"

import type { Locale, T } from "@workspace/i18n"
import { Container } from "@/components/container"

interface FooterProps {
    lang: Locale
    t: T["footer"]
    nav: T["nav"]
    info: T["info"]["nav"]
}

/**
 * Static footer — Server Component (no state, no handlers, exception per
 * the route-scoped constitution applies).
 */
export function Footer({ lang, t, nav, info }: FooterProps) {
    const year = new Date().getFullYear()

    return (
        <footer className="mt-auto border-t border-border bg-card/40">
            <Container className="py-12 @2xl:py-16">
                <div className="grid gap-10 @2xl:grid-cols-2 @5xl:grid-cols-4">
                    <div className="@5xl:col-span-2">
                        <Link href={`/${lang}`} className="flex items-center gap-2 font-bold text-foreground">
                            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <RiHeartPulseLine className="size-5" aria-hidden="true" />
                            </span>
                            <span className="text-lg tracking-tight">RaktoSetu</span>
                        </Link>
                        <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                            {t.aboutDesc}
                        </p>
                        <p className="mt-4 max-w-sm rounded-lg border border-border bg-background/60 p-3 text-xs leading-relaxed text-muted-foreground">
                            {t.disclaimerNote}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-foreground">{t.quickLinks}</h3>
                        <ul className="mt-4 space-y-2.5 text-sm">
                            <li>
                                <Link href={`/${lang}`} className="text-muted-foreground transition-colors hover:text-foreground">
                                    {nav.home}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${lang}/donors`} className="text-muted-foreground transition-colors hover:text-foreground">
                                    {nav.donors}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${lang}/requests`} className="text-muted-foreground transition-colors hover:text-foreground">
                                    {nav.requests}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${lang}/announcements`} className="text-muted-foreground transition-colors hover:text-foreground">
                                    {nav.announcements}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-foreground">{t.resources}</h3>
                        <ul className="mt-4 space-y-2.5 text-sm">
                            <li>
                                <Link href={`/${lang}/info/faqs`} className="text-muted-foreground transition-colors hover:text-foreground">
                                    {info.faqs}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${lang}/info/compatibility`} className="text-muted-foreground transition-colors hover:text-foreground">
                                    {info.compatibility}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${lang}/info/eligibility`} className="text-muted-foreground transition-colors hover:text-foreground">
                                    {info.eligibility}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${lang}/announcements`} className="text-muted-foreground transition-colors hover:text-foreground">
                                    {nav.announcements}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 @2xl:flex-row">
                    <p className="text-xs text-muted-foreground">
                        © {year} RaktoSetu. {t.rights}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="hover:text-foreground">{t.privacy}</span>
                        <span className="hover:text-foreground">{t.terms}</span>
                        <span className="hover:text-foreground">{t.disclaimer}</span>
                    </div>
                </div>
            </Container>
        </footer>
    )
}
