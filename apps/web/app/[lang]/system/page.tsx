import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { isLocale } from "@workspace/i18n"
import { SystemClient } from "./system-client"

export const metadata: Metadata = {
    title: "API status",
    description: "API health and public endpoint coverage.",
}

export default async function SystemPage({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    return <SystemClient lang={lang} />
}
