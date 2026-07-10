import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getTranslation, isLocale } from "@workspace/i18n"
import { Hero } from "./home/01-hero"
import { Availability } from "./home/02-availability"
import { UrgentRequests } from "./home/03-urgent-requests"
import { HowItWorks } from "./home/04-how-it-works"
import { Announcements } from "./home/05-announcements"
import { Faq } from "./home/06-faq"
import { Cta } from "./home/07-cta"

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>
}): Promise<Metadata> {
    const { lang } = await params
    const t = getTranslation(lang)
    const canonicalLang = isLocale(lang) ? lang : "en"
    return {
        title: t.home.meta.title,
        description: t.home.meta.description,
        alternates: { canonical: `/${canonicalLang}` },
    }
}

export default async function HomePage({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    const t = getTranslation(lang)

    return (
        <>
            <Hero
                lang={lang}
                t={t.home.hero}
                cta={{ request: t.nav.requestBlood, find: t.home.hero.ctaFindDonor }} />
            <Availability
                lang={lang}
                t={t.home.availability} />
            <UrgentRequests
                lang={lang}
                t={t.home.urgent}
                urgency={t.urgency}
                common={t.common}
            />
            <HowItWorks t={t.home.howItWorks} />
            <Announcements lang={lang} t={t.home.announcements} common={t.common} />
            <Faq t={t.home.faq} />
            <Cta t={t.home.cta} lang={lang} />
        </>
    )
}
