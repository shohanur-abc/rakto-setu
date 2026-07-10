import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { isLocale } from "@workspace/i18n"
import { RecipientRequestDetailClient } from "./recipient-request-detail-client"

export const metadata: Metadata = {
    title: "Request detail",
    description: "Recipient request detail, status, match, and completion endpoints.",
}

export default async function RecipientRequestDetailPage({
    params,
}: {
    params: Promise<{ lang: string; id: string }>
}) {
    const { lang, id } = await params
    if (!isLocale(lang)) notFound()
    return <RecipientRequestDetailClient lang={lang} id={id} />
}
