import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { isLocale } from "@workspace/i18n"
import { AdminModerationClient } from "./moderation-client"

export const metadata: Metadata = { title: "Admin moderation" }

export default async function AdminModerationPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    return <AdminModerationClient lang={lang} />
}
