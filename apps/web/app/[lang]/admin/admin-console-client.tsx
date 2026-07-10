"use client"

import { useAdminDashboard } from "api-client/src/admin"
import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { ErrorState, FieldList, LoadingRows } from "@/components/api-surface"
import { AdminTabs } from "./admin-tabs"

export function AdminConsoleClient({ lang }: { lang: string }) {
    const dashboard = useAdminDashboard()

    return (
        <>
            <PageHeader eyebrow="Admin" title="Admin dashboard" subtitle="Operational metrics for the platform." />
            <AdminTabs lang={lang} />
            <Container className="py-8 @2xl:py-10">
                {dashboard.error ? (
                    <ErrorState error={dashboard.error} />
                ) : dashboard.isLoading ? (
                    <LoadingRows rows={2} />
                ) : dashboard.data ? (
                    <FieldList
                        items={[
                            ["Users", dashboard.data.users],
                            ["Active donors", dashboard.data.activeDonors],
                            ["Pending donors", dashboard.data.pendingDonors],
                            ["Pending requests", dashboard.data.pendingRequests],
                            ["Published requests", dashboard.data.publishedRequests],
                            ["Fulfilled requests", dashboard.data.fulfilledRequests],
                        ]}
                    />
                ) : null}
            </Container>
        </>
    )
}
