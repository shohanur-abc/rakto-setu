import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { isLocale } from "@workspace/i18n"
import { DonorRequestsClient } from "./requests-client"

export const metadata: Metadata = { title: "Donor matching requests" }

export default async function DonorRequestsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    return <DonorRequestsClient lang={lang} />
}
