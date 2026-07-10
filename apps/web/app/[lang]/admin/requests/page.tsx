import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { isLocale } from "@workspace/i18n"
import { AdminRequestsClient } from "./requests-client"

export const metadata: Metadata = { title: "Admin requests" }

export default async function AdminRequestsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    return <AdminRequestsClient lang={lang} />
}
