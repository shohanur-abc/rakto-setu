import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getTranslation, isLocale } from "@workspace/i18n"
import { requestsGetPublic } from "api-client/src/requests"
import { RequestDetailClient } from "./request-detail-client"

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string; id: string }>
}): Promise<Metadata> {
    const { lang, id } = await params
    const t = getTranslation(lang)
    const canonicalLang = isLocale(lang) ? lang : "en"
    try {
        const res = await requestsGetPublic(id)
        return {
            title: `${res.patientName} — ${res.bloodGroup}`,
            description: t.requests.meta.description,
            alternates: { canonical: `/${canonicalLang}/requests/${id}` },
        }
    } catch {
        return { title: t.requests.title }
    }
}

export default async function RequestDetailPage({
    params,
}: {
    params: Promise<{ lang: string; id: string }>
}) {
    const { lang, id } = await params
    if (!isLocale(lang)) notFound()
    const t = getTranslation(lang)

    return (
        <RequestDetailClient
            lang={lang}
            id={id}
            t={t.requests}
            urgency={t.urgency}
            status={t.status}
        />
    )
}
