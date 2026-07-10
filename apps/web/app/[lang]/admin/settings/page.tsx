import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { isLocale } from "@workspace/i18n"
import { AdminSettingsClient } from "./settings-client"

export const metadata: Metadata = { title: "Admin settings" }

export default async function AdminSettingsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    return <AdminSettingsClient lang={lang} />
}
