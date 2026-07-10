"use client"

import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import { getDonorsGetAcceptedRequestsQueryKey, getDonorsGetDonationsQueryKey, getDonorsGetEligibilityQueryKey, useDonorsCancelAcceptedRequest, useDonorsConfirmCompletion, useDonorsGetAcceptedRequests } from "api-client/src/donors"
import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { EmptyState, ErrorState, FieldList, LoadingRows } from "@/components/api-surface"
import { DonorTabs } from "../donor-tabs"

export function DonorAcceptedClient({ lang }: { lang: string }) {
    const queryClient = useQueryClient()
    const accepted = useDonorsGetAcceptedRequests()
    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: getDonorsGetAcceptedRequestsQueryKey() })
        queryClient.invalidateQueries({ queryKey: getDonorsGetDonationsQueryKey() })
        queryClient.invalidateQueries({ queryKey: getDonorsGetEligibilityQueryKey() })
    }
    const cancel = useDonorsCancelAcceptedRequest({ mutation: { onSuccess: invalidate } })
    const confirm = useDonorsConfirmCompletion({ mutation: { onSuccess: invalidate } })

    return (
        <>
            <PageHeader eyebrow="Donor" title="Accepted requests" subtitle="Manage accepted requests and donor-side completion." />
            <DonorTabs lang={lang} />
            <Container className="space-y-4 py-8 @2xl:py-10">
                {accepted.error ? <ErrorState error={accepted.error} /> : accepted.isLoading ? <LoadingRows /> : accepted.data?.length ? accepted.data.map((request) => (
                    <div key={request.id} className="rounded-lg border border-border bg-card p-4">
                        <FieldList items={[["Patient", request.patientName], ["Status", request.status], ["Recipient", request.recipientContact.fullName], ["Phone", request.recipientContact.phone]]} />
                        <Separator className="my-4" />
                        <div className="flex flex-wrap gap-2">
                            <Button size="sm" onClick={() => confirm.mutate({ id: request.requestId, data: { units: 1 } })} disabled={confirm.isPending}>Confirm completion</Button>
                            <Button size="sm" variant="destructive" onClick={() => cancel.mutate({ id: request.requestId, data: { cancelReason: "Cancelled from frontend" } })} disabled={cancel.isPending}>Cancel accepted</Button>
                        </div>
                    </div>
                )) : <EmptyState>You have no accepted requests yet.</EmptyState>}
                {(cancel.error || confirm.error) && <ErrorState error={cancel.error ?? confirm.error} />}
            </Container>
        </>
    )
}
