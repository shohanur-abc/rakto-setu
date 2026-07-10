import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getTranslation, isLocale } from "@workspace/i18n"
import { EligibilityClient } from "./eligibility-client"

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>
}): Promise<Metadata> {
    const { lang } = await params
    const t = getTranslation(lang)
    const canonicalLang = isLocale(lang) ? lang : "en"
    return {
        title: t.info.eligibility.title,
        description: t.info.meta.description,
        alternates: { canonical: `/${canonicalLang}/info/eligibility` },
    }
}

export default async function EligibilityPage({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    const t = getTranslation(lang)

    return <EligibilityClient lang={lang} t={t.info} />
}
