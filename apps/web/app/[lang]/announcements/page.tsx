import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getTranslation, isLocale } from "@workspace/i18n"
import { AnnouncementsClient } from "./announcements-client"

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>
}): Promise<Metadata> {
    const { lang } = await params
    const t = getTranslation(lang)
    const canonicalLang = isLocale(lang) ? lang : "en"
    return {
        title: t.announcements.meta.title,
        description: t.announcements.meta.description,
        alternates: { canonical: `/${canonicalLang}/announcements` },
    }
}

export default async function AnnouncementsPage({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    const t = getTranslation(lang)

    return <AnnouncementsClient lang={lang} t={t.announcements} />
}
