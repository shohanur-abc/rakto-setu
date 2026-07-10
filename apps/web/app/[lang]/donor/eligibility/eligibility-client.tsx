"use client"

import { useDonorsGetEligibility } from "api-client/src/donors"
import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { ApiSection, ErrorState, JsonPanel, LoadingRows } from "@/components/api-surface"
import { DonorTabs } from "../donor-tabs"

export function DonorEligibilityClient({ lang }: { lang: string }) {
    const eligibility = useDonorsGetEligibility()
    return (
        <>
            <PageHeader eyebrow="Donor" title="Eligibility" subtitle="Current donor eligibility and next eligible date." />
            <DonorTabs lang={lang} />
            <Container className="py-8 @2xl:py-10">
                <ApiSection title="Current eligibility" description="Use this status before accepting a new request.">
                    {eligibility.error ? <ErrorState error={eligibility.error} /> : eligibility.isLoading ? <LoadingRows rows={1} /> : <JsonPanel value={eligibility.data} />}
                </ApiSection>
            </Container>
        </>
    )
}
