import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { isLocale } from "@workspace/i18n"
import { DonorConsoleClient } from "./donor-console-client"

export const metadata: Metadata = {
    title: "Donor console",
    description: "Donor profile, request, donation, and eligibility endpoints.",
}

export default async function DonorConsolePage({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    return <DonorConsoleClient lang={lang} />
}
