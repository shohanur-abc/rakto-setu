"use client"

import { useAppHealth } from "api-client/src/health"
import { useLocationsList } from "api-client/src/locations"
import { useInfoCompatibility, useInfoEligibility, useInfoFaqs } from "api-client/src/info"
import { useSearchAvailabilitySummary } from "api-client/src/search"
import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { ApiGrid, ApiSection, EmptyState, ErrorState, FieldList, JsonPanel, LoadingRows } from "@/components/api-surface"

export function SystemClient({ lang }: { lang: string }) {
    const health = useAppHealth()
    const locations = useLocationsList()
    const faqs = useInfoFaqs()
    const compatibility = useInfoCompatibility()
    const eligibility = useInfoEligibility()
    const summary = useSearchAvailabilitySummary()

    return (
        <>
            <PageHeader
                eyebrow="/api/v1"
                title="Public API coverage"
                subtitle="Health, locations, information, and availability endpoints."
            />
            <Container className="space-y-4 py-10 @2xl:py-12">
                <ApiGrid>
                    <ApiSection title="Health" description="GET /api/v1">
                        {health.error ? <ErrorState error={health.error} /> : health.isLoading ? <LoadingRows rows={1} /> : <JsonPanel value={health.data} />}
                    </ApiSection>
                    <ApiSection title="Locations" description="GET /api/v1/locations">
                        {locations.error ? (
                            <ErrorState error={locations.error} />
                        ) : locations.isLoading ? (
                            <LoadingRows />
                        ) : locations.data?.length ? (
                            <div className="space-y-2">
                                {locations.data.map((location) => (
                                    <FieldList
                                        key={location.id}
                                        items={[
                                            ["Name", location.name],
                                            ["Type", location.type],
                                            ["Parent", location.parentId ?? "—"],
                                        ]}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyState />
                        )}
                    </ApiSection>
                    <ApiSection title="Availability summary" description="GET /api/v1/search/availability-summary">
                        {summary.error ? <ErrorState error={summary.error} /> : summary.isLoading ? <LoadingRows /> : <JsonPanel value={summary.data} />}
                    </ApiSection>
                    <ApiSection title="Compatibility" description="GET /api/v1/info/compatibility">
                        {compatibility.error ? <ErrorState error={compatibility.error} /> : compatibility.isLoading ? <LoadingRows /> : <JsonPanel value={compatibility.data} />}
                    </ApiSection>
                    <ApiSection title="Eligibility" description="GET /api/v1/info/eligibility">
                        {eligibility.error ? <ErrorState error={eligibility.error} /> : eligibility.isLoading ? <LoadingRows rows={1} /> : <JsonPanel value={eligibility.data} />}
                    </ApiSection>
                    <ApiSection title="FAQs" description="GET /api/v1/info/faqs">
                        {faqs.error ? (
                            <ErrorState error={faqs.error} />
                        ) : faqs.isLoading ? (
                            <LoadingRows />
                        ) : faqs.data?.length ? (
                            <div className="space-y-3">
                                {faqs.data.map((faq) => (
                                    <div key={faq.question} className="rounded-lg bg-secondary/60 p-3">
                                        <h3 className="font-medium text-foreground">{faq.question}</h3>
                                        <p className="mt-1 text-sm text-muted-foreground">{faq.answer}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState />
                        )}
                    </ApiSection>
                </ApiGrid>
                <p className="text-xs text-muted-foreground">Locale: {lang}</p>
            </Container>
        </>
    )
}
