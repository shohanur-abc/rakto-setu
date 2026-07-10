"use client"

import Link from "next/link"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import { getRequestsListOwnQueryKey, useRequestsCancel, useRequestsListOwn } from "api-client/src/requests"
import { BloodGroupBadge } from "@/components/blood-group-badge"
import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { EmptyState, ErrorState, LoadingRows, formatDate } from "@/components/api-surface"
import { RecipientTabs } from "../recipient-tabs"

const ownParams = { page: 1, limit: 50 }

export function RecipientRequestsClient({ lang }: { lang: string }) {
    const queryClient = useQueryClient()
    const list = useRequestsListOwn(ownParams)
    const cancel = useRequestsCancel({
        mutation: {
            onSuccess: () => queryClient.invalidateQueries({ queryKey: getRequestsListOwnQueryKey(ownParams) }),
        },
    })

    return (
        <>
            <PageHeader eyebrow="Recipient" title="My blood requests" subtitle="List and manage recipient-owned requests." />
            <RecipientTabs lang={lang} />
            <Container className="space-y-4 py-8 @2xl:py-10">
                {list.error ? <ErrorState error={list.error} /> : list.isLoading ? <LoadingRows /> : list.data?.items.length ? list.data.items.map((request) => (
                    <div key={request.id} className="rounded-lg border border-border bg-card p-4">
                        <div className="flex flex-col gap-3 @2xl:flex-row @2xl:items-start @2xl:justify-between">
                            <div className="min-w-0">
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <BloodGroupBadge group={request.bloodGroup} />
                                    <StatusBadge status={request.status} label={request.status} />
                                </div>
                                <h3 className="font-semibold text-foreground">{request.patientName}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">{request.hospitalName}</p>
                            </div>
                            <p className="text-sm font-medium text-foreground @2xl:text-right">Needed {formatDate(request.neededBy, lang)}</p>
                        </div>
                        <Separator className="my-4" />
                        <div className="flex flex-wrap gap-2">
                            <Button asChild size="sm" variant="outline">
                                <Link href={`/${lang}/recipient/requests/${request.id}`}>Details</Link>
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => cancel.mutate({ id: request.id })} disabled={cancel.isPending}>Cancel</Button>
                        </div>
                    </div>
                )) : <EmptyState>You have not created any requests yet.</EmptyState>}
                {cancel.error && <ErrorState error={cancel.error} />}
            </Container>
        </>
    )
}
