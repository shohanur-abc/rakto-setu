import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { isLocale } from "@workspace/i18n"
import { DonorDonationsClient } from "./donations-client"

export const metadata: Metadata = { title: "Donor donations" }

export default async function DonorDonationsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    return <DonorDonationsClient lang={lang} />
}
