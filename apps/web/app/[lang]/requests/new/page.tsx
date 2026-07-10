import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getTranslation, isLocale } from "@workspace/i18n"
import { NewRequestClient } from "./new-request-client"

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>
}): Promise<Metadata> {
    const { lang } = await params
    const t = getTranslation(lang)
    const canonicalLang = isLocale(lang) ? lang : "en"
    return {
        title: t.requests.new.title,
        description: t.requests.new.subtitle,
        alternates: { canonical: `/${canonicalLang}/requests/new` },
    }
}

export default async function NewRequestPage({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    const t = getTranslation(lang)

    return (
        <NewRequestClient
            lang={lang}
            t={t.requests}
            urgency={t.urgency}
            common={t.common}
        />
    )
}
