"use client"

import { useDonorsGetDonations } from "api-client/src/donors"
import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { ApiSection, ErrorState, JsonPanel, LoadingRows } from "@/components/api-surface"
import { DonorTabs } from "../donor-tabs"

export function DonorDonationsClient({ lang }: { lang: string }) {
    const donations = useDonorsGetDonations()
    return (
        <>
            <PageHeader eyebrow="Donor" title="Donation history" subtitle="Completed donation records." />
            <DonorTabs lang={lang} />
            <Container className="py-8 @2xl:py-10">
                <ApiSection title="Donation records" description="Completed donations synced from fulfilled requests.">
                    {donations.error ? <ErrorState error={donations.error} /> : donations.isLoading ? <LoadingRows /> : <JsonPanel value={donations.data} />}
                </ApiSection>
            </Container>
        </>
    )
}
