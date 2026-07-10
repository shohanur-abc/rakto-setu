import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getTranslation, isLocale } from "@workspace/i18n"
import { RequestsClient } from "./requests-client"

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>
}): Promise<Metadata> {
    const { lang } = await params
    const t = getTranslation(lang)
    const canonicalLang = isLocale(lang) ? lang : "en"
    return {
        title: t.requests.meta.title,
        description: t.requests.meta.description,
        alternates: { canonical: `/${canonicalLang}/requests` },
    }
}

export default async function RequestsPage({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    const t = getTranslation(lang)

    return <RequestsClient lang={lang} t={t.requests} urgency={t.urgency} />
}
