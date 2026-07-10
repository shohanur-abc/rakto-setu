import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { isLocale } from "@workspace/i18n"
import { AuthActionsClient } from "./auth-actions-client"

export const metadata: Metadata = {
    title: "Account actions",
    description: "Authentication and password action endpoints.",
}

export default async function AuthActionsPage({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    return <AuthActionsClient />
}
