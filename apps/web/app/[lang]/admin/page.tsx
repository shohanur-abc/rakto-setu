import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { isLocale } from "@workspace/i18n"
import { AdminConsoleClient } from "./admin-console-client"

export const metadata: Metadata = {
    title: "Admin console",
    description: "Admin dashboard, user, donor, request, report, announcement, moderation, and settings endpoints.",
}

export default async function AdminPage({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    return <AdminConsoleClient lang={lang} />
}
