"use client"

import { useState } from "react"
import { RiHandHeartLine, RiSearchLine } from "@remixicon/react"
import { useQueryClient } from "@tanstack/react-query"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Separator } from "@workspace/ui/components/separator"
import {
    getAdminDashboardQueryKey,
    getAdminListRequestsQueryKey,
    useAdminAssignDonor,
    useAdminCloseRequest,
    useAdminListRequests,
    useAdminPublishRequest,
    useAdminRejectRequest,
} from "api-client/src/admin"
import { BloodGroupBadge } from "@/components/blood-group-badge"
import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { EmptyState, ErrorState, LoadingRows, formValue, formatDate } from "@/components/api-surface"
import { AdminTabs } from "../admin-tabs"

const requestParams = { page: 1, limit: 20 }

export function AdminRequestsClient({ lang }: { lang: string }) {
    const queryClient = useQueryClient()
    const [donorId, setDonorId] = useState("")
    const requests = useAdminListRequests(requestParams)
    const items = requests.data?.items ?? []
    const pending = items.filter((request) => request.status === "pending_review").length
    const published = items.filter((request) => request.status === "published").length
    const closed = items.filter((request) => ["fulfilled", "cancelled", "expired", "unfulfilled"].includes(request.status)).length
    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: getAdminListRequestsQueryKey(requestParams) })
        queryClient.invalidateQueries({ queryKey: getAdminDashboardQueryKey() })
    }
    const publish = useAdminPublishRequest({ mutation: { onSuccess: invalidate } })
    const reject = useAdminRejectRequest({ mutation: { onSuccess: invalidate } })
    const assign = useAdminAssignDonor({ mutation: { onSuccess: invalidate } })
    const close = useAdminCloseRequest({ mutation: { onSuccess: invalidate } })

    return (
        <>
            <PageHeader eyebrow="Admin" title="Requests" subtitle="Review requests, publish valid cases, assign donors, and close stale work." />
            <AdminTabs lang={lang} />
            <Container className="space-y-6 py-8 @2xl:py-10">
                <div className="grid gap-3 @2xl:grid-cols-3">
                    <Stat label="Pending review" value={pending} />
                    <Stat label="Published" value={published} />
                    <Stat label="Closed" value={closed} />
                </div>
                <form
                    className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 @2xl:flex-row @2xl:items-center"
                    onSubmit={(event) => {
                        event.preventDefault()
                        setDonorId(formValue(event.currentTarget, "donorId") ?? "")
                    }}
                >
                    <div className="relative flex-1">
                        <RiSearchLine className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input name="donorId" defaultValue={donorId} placeholder="Donor user id for assignment actions" className="pl-9" />
                    </div>
                    <Button type="submit" variant="outline">Use donor id</Button>
                </form>
                {(publish.error || reject.error || assign.error || close.error) && <ErrorState error={publish.error ?? reject.error ?? assign.error ?? close.error} />}
                {requests.error ? <ErrorState error={requests.error} /> : requests.isLoading ? <LoadingRows rows={6} /> : items.length ? (
                    <div className="overflow-hidden rounded-lg border border-border bg-card">
                        {items.map((request, index) => (
                            <div key={request.id}>
                                <div className="flex flex-col gap-3 p-4 @5xl:flex-row @5xl:items-center @5xl:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                <RiHandHeartLine className="size-4" aria-hidden="true" />
                                            </span>
                                            <h3 className="font-semibold text-foreground">{request.patientName}</h3>
                                            <BloodGroupBadge group={request.bloodGroup} />
                                            <StatusBadge status={request.status} label={request.status} />
                                            <Badge variant="outline">{request.urgency}</Badge>
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                            <span>{request.hospitalName}</span>
                                            <span>{request.unitsFulfilled}/{request.unitsNeeded} units</span>
                                            <span>Needed {formatDate(request.neededBy, lang)}</span>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 flex-wrap gap-2">
                                        <Button size="sm" onClick={() => publish.mutate({ id: request.id })} disabled={publish.isPending}>Publish</Button>
                                        <Button size="sm" variant="outline" onClick={() => reject.mutate({ id: request.id })} disabled={reject.isPending}>Reject</Button>
                                        <Button size="sm" variant="outline" onClick={() => assign.mutate({ id: request.id, data: { donorId: donorId || request.recipientId } })} disabled={assign.isPending}>Assign donor</Button>
                                        <Button size="sm" variant="destructive" onClick={() => close.mutate({ id: request.id, data: { status: "unfulfilled" } })} disabled={close.isPending}>Close</Button>
                                    </div>
                                </div>
                                {index < items.length - 1 && <Separator />}
                            </div>
                        ))}
                    </div>
                ) : <EmptyState>No admin requests match the current filters.</EmptyState>}
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
