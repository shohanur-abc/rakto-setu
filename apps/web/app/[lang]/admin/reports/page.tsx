import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { isLocale } from "@workspace/i18n"
import { AdminReportsClient } from "./reports-client"

export const metadata: Metadata = { title: "Admin reports" }

export default async function AdminReportsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    return <AdminReportsClient lang={lang} />
}
