import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { isLocale } from "@workspace/i18n"
import { AdminUsersClient } from "./users-client"

export const metadata: Metadata = { title: "Admin users" }

export default async function AdminUsersPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    return <AdminUsersClient lang={lang} />
}
