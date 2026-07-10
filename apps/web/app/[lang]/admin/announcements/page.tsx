import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { isLocale } from "@workspace/i18n"
import { AdminAnnouncementsClient } from "./announcements-client"

export const metadata: Metadata = { title: "Admin announcements" }

export default async function AdminAnnouncementsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    return <AdminAnnouncementsClient lang={lang} />
}
