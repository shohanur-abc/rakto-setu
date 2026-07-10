import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { isLocale } from "@workspace/i18n"
import { RecipientRequestsClient } from "./recipient-requests-client"

export const metadata: Metadata = {
    title: "My blood requests",
    description: "Recipient blood request endpoints.",
}

export default async function RecipientRequestsPage({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    return <RecipientRequestsClient lang={lang} />
}
