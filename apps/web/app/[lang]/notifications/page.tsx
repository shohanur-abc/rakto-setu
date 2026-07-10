import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { isLocale } from "@workspace/i18n"
import { NotificationsClient } from "./notifications-client"

export const metadata: Metadata = {
    title: "Notifications",
    description: "Notification list and read-state endpoints.",
}

export default async function NotificationsPage({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    return <NotificationsClient />
}
