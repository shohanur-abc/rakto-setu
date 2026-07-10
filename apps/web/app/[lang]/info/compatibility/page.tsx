import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getTranslation, isLocale } from "@workspace/i18n"
import { CompatibilityClient } from "./compatibility-client"

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>
}): Promise<Metadata> {
    const { lang } = await params
    const t = getTranslation(lang)
    const canonicalLang = isLocale(lang) ? lang : "en"
    return {
        title: t.info.compatibility.title,
        description: t.info.meta.description,
        alternates: { canonical: `/${canonicalLang}/info/compatibility` },
    }
}

export default async function CompatibilityPage({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    const t = getTranslation(lang)

    return <CompatibilityClient lang={lang} t={t.info} />
}
