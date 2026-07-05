import { Suspense } from "react"
import { connection } from "next/server"
import { RiHistoryLine } from "@remixicon/react"
import { Section } from "@workspace/ui/components/section"
import { AppEmpty } from "@/components/app-empty"
import { AppTable } from "@/components/app-table"
import { PrivateNav } from "@/components/private-nav"
import { getDonorDonations, getPrivateProfile } from "@/lib/api/private-data"
import type { Locale } from "@/lib/i18n/config"

interface DonorDonationsPageProps {
    params: Promise<{ lang: Locale }>
}

export default async function DonorDonationsPage({
    params,
}: DonorDonationsPageProps) {
    const { lang } = await params

    return (
        <Section
            eyebrow={{ icon: <RiHistoryLine />, text: "Donor" }}
            title="Donation history"
            description="Completed donations confirmed by both request recipient and donor."
            align="left"
        >
            <Suspense fallback={<div className="h-80 rounded-lg bg-muted" />}>
                <DonorDonationsContent lang={lang} />
            </Suspense>
        </Section>
    )
}

async function DonorDonationsContent({ lang }: { lang: Locale }) {
    await connection()
    const [user, donations] = await Promise.all([
        getPrivateProfile(lang),
        getDonorDonations(lang),
    ])

    return (
        <div className="space-y-8">
            <PrivateNav lang={lang} role={user.role} />
            {donations.length === 0 ? (
                <AppEmpty>No completed donations recorded yet.</AppEmpty>
            ) : (
                <AppTable
                    headers={["Date", "Patient", "Units", "Request"]}
                    rows={donations.map((donation) => [
                        new Date(donation.donationDate).toLocaleDateString("en-BD", {
                            dateStyle: "medium",
                        }),
                        donation.patientName ?? "N/A",
                        donation.units,
                        donation.requestId ?? "N/A",
                    ])}
                />
            )}
        </div>
    )
}
