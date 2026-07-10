import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { isLocale } from "@workspace/i18n"
import { DonorAcceptedClient } from "./accepted-client"

export const metadata: Metadata = { title: "Donor accepted requests" }

export default async function DonorAcceptedPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    return <DonorAcceptedClient lang={lang} />
}
