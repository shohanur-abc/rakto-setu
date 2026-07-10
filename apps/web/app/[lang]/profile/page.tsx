import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { isLocale } from "@workspace/i18n"
import { ProfileClient } from "./profile-client"

export const metadata: Metadata = {
    title: "Profile",
    description: "Authenticated user profile endpoints.",
}

export default async function ProfilePage({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    return <ProfileClient lang={lang} />
}
