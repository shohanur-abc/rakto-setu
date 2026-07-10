import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getTranslation, isLocale } from "@workspace/i18n"
import { DonorsClient } from "./donors-client"

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>
}): Promise<Metadata> {
    const { lang } = await params
    const t = getTranslation(lang)
    const canonicalLang = isLocale(lang) ? lang : "en"
    return {
        title: t.donors.meta.title,
        description: t.donors.meta.description,
        alternates: { canonical: `/${canonicalLang}/donors` },
    }
}

export default async function DonorsPage({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    const t = getTranslation(lang)

    return <DonorsClient lang={lang} t={t.donors} common={t.common} />
}
