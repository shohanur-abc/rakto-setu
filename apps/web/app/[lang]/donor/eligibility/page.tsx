import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { isLocale } from "@workspace/i18n"
import { DonorEligibilityClient } from "./eligibility-client"

export const metadata: Metadata = { title: "Donor eligibility" }

export default async function DonorEligibilityPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    return <DonorEligibilityClient lang={lang} />
}
