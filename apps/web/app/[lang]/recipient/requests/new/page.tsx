import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { isLocale } from "@workspace/i18n"
import { RecipientNewRequestClient } from "./new-request-client"

export const metadata: Metadata = { title: "Create recipient request" }

export default async function RecipientNewRequestPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    return <RecipientNewRequestClient lang={lang} />
}
