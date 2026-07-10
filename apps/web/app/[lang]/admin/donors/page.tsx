import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { isLocale } from "@workspace/i18n"
import { AdminDonorsClient } from "./donors-client"

export const metadata: Metadata = { title: "Admin donors" }

export default async function AdminDonorsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    return <AdminDonorsClient lang={lang} />
}
