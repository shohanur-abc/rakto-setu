"use client"

import { RiDownloadLine } from "@remixicon/react"
import { Badge } from "@workspace/ui/components/badge"
import { useAdminExportReports, useAdminReports } from "api-client/src/admin"
import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { ErrorState, JsonPanel, LoadingRows } from "@/components/api-surface"
import { AdminTabs } from "../admin-tabs"

const reportParams = {}

export function AdminReportsClient({ lang }: { lang: string }) {
    const reports = useAdminReports(reportParams)
    const exportReports = useAdminExportReports(reportParams)
    const totalRequests = reports.data?.requestsByStatus.reduce((sum, item) => sum + item.count, 0) ?? 0

    return (
        <>
            <PageHeader eyebrow="Admin" title="Reports" subtitle="Track request outcomes and prepare exports for local operators." />
            <AdminTabs lang={lang} />
            <Container className="space-y-6 py-8 @2xl:py-10">
                <div className="grid gap-3 @2xl:grid-cols-3">
                    <Stat label="Requests in report" value={totalRequests} />
                    <Stat label="Donations" value={reports.data?.donations ?? 0} />
                    <Stat label="Status buckets" value={reports.data?.requestsByStatus.length ?? 0} />
                </div>
                <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1fr)_360px]">
                    <section>
                        <div className="mb-3">
                            <h2 className="text-lg font-semibold text-foreground">Requests by status</h2>
                            <p className="text-sm text-muted-foreground">Outcome distribution for the selected report period.</p>
                        </div>
                        {reports.error ? <ErrorState error={reports.error} /> : reports.isLoading ? <LoadingRows rows={5} /> : reports.data?.requestsByStatus.length ? (
                            <div className="space-y-3">
                                {reports.data.requestsByStatus.map((item) => (
                                    <div key={item.status} className="rounded-lg border border-border bg-card p-4">
                                        <div className="mb-2 flex items-center justify-between">
                                            <Badge variant="outline">{item.status}</Badge>
                                            <span className="font-semibold tabular-nums text-foreground">{item.count}</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-secondary">
                                            <div className="h-full rounded-full bg-primary" style={{ width: `${totalRequests ? (item.count / totalRequests) * 100 : 0}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <JsonPanel value={reports.data} />}
                    </section>
                    <aside className="h-fit rounded-lg border border-border bg-card p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <RiDownloadLine className="size-5" aria-hidden="true" />
                            </span>
                            <div>
                                <h2 className="font-semibold text-foreground">Export preview</h2>
                                <p className="text-xs text-muted-foreground">CSV export endpoint response.</p>
                            </div>
                        </div>
                        {exportReports.error ? <ErrorState error={exportReports.error} /> : exportReports.isLoading ? <LoadingRows rows={1} /> : <JsonPanel value={exportReports.data} />}
                    </aside>
                </div>
            </Container>
        </>
    )
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
        </div>
    )
}
