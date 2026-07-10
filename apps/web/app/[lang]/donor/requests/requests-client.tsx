"use client"

import { useQueryClient } from "@tanstack/react-query"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import { getDonorsGetAcceptedRequestsQueryKey, getDonorsGetMatchingRequestsQueryKey, useDonorsAcceptRequest, useDonorsDeclineRequest, useDonorsGetMatchingRequests } from "api-client/src/donors"
import { BloodGroupBadge } from "@/components/blood-group-badge"
import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { EmptyState, ErrorState, LoadingRows, formatDate } from "@/components/api-surface"
import { DonorTabs } from "../donor-tabs"

const matchingParams = {}

export function DonorRequestsClient({ lang }: { lang: string }) {
    const queryClient = useQueryClient()
    const matching = useDonorsGetMatchingRequests(matchingParams)
    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: getDonorsGetMatchingRequestsQueryKey(matchingParams) })
        queryClient.invalidateQueries({ queryKey: getDonorsGetAcceptedRequestsQueryKey() })
    }
    const accept = useDonorsAcceptRequest({ mutation: { onSuccess: invalidate } })
    const decline = useDonorsDeclineRequest({ mutation: { onSuccess: invalidate } })

    return (
        <>
            <PageHeader eyebrow="Donor" title="Matching requests" subtitle="Review nearby matching blood requests." />
            <DonorTabs lang={lang} />
            <Container className="space-y-4 py-8 @2xl:py-10">
                {matching.error ? <ErrorState error={matching.error} /> : matching.isLoading ? <LoadingRows /> : matching.data?.length ? matching.data.map((request) => (
                    <div key={request.id} className="rounded-lg border border-border bg-card p-4">
                        <div className="flex flex-col gap-3 @2xl:flex-row @2xl:items-start @2xl:justify-between">
                            <div className="min-w-0">
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <BloodGroupBadge group={request.bloodGroup} />
                                    <Badge variant="outline">{request.urgency}</Badge>
                                </div>
                                <h3 className="font-semibold text-foreground">{request.patientName}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">{request.hospitalName}</p>
                            </div>
                            <p className="text-sm font-medium text-foreground @2xl:text-right">Needed {formatDate(request.neededBy, lang)}</p>
                        </div>
                        <Separator className="my-4" />
                        <div className="flex flex-wrap gap-2">
                            <Button size="sm" onClick={() => accept.mutate({ id: request.id })} disabled={accept.isPending}>Accept</Button>
                            <Button size="sm" variant="outline" onClick={() => decline.mutate({ id: request.id })} disabled={decline.isPending}>Decline</Button>
                        </div>
                    </div>
                )) : <EmptyState>No matching requests are available right now.</EmptyState>}
                {(accept.error || decline.error) && <ErrorState error={accept.error ?? decline.error} />}
            </Container>
        </>
    )
}
