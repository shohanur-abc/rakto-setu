"use client"

import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import {
    getRequestsGetMatchesQueryKey,
    getRequestsGetOwnQueryKey,
    getRequestsGetStatusQueryKey,
    useRequestsCancelMatch,
    useRequestsConfirmCompletion,
    useRequestsGetMatches,
    useRequestsGetOwn,
    useRequestsGetStatus,
    useRequestsUpdate,
} from "api-client/src/requests"
import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { ApiGrid, ApiSection, EmptyState, ErrorState, FieldList, JsonPanel, LoadingRows, SubmitButton, TextAreaField, TextField, formNumber, formValue, formatDate } from "@/components/api-surface"
import { RecipientTabs } from "../../recipient-tabs"

export function RecipientRequestDetailClient({ lang, id }: { lang: string; id: string }) {
    const queryClient = useQueryClient()
    const detail = useRequestsGetOwn(id)
    const status = useRequestsGetStatus(id)
    const matches = useRequestsGetMatches(id)
    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: getRequestsGetOwnQueryKey(id) })
        queryClient.invalidateQueries({ queryKey: getRequestsGetStatusQueryKey(id) })
        queryClient.invalidateQueries({ queryKey: getRequestsGetMatchesQueryKey(id) })
    }
    const update = useRequestsUpdate({ mutation: { onSuccess: invalidate } })
    const confirm = useRequestsConfirmCompletion({ mutation: { onSuccess: invalidate } })
    const cancelMatch = useRequestsCancelMatch({ mutation: { onSuccess: invalidate } })

    return (
        <>
            <PageHeader eyebrow="Recipient detail" title="Request detail" subtitle="Own request detail, status, matches, update, cancel match, and completion." />
            <RecipientTabs lang={lang} />
            <Container className="space-y-4 py-8 @2xl:py-10">
                <ApiGrid>
                    <ApiSection title="Detail" description="GET /api/v1/requests/{id}">
                        {detail.error ? <ErrorState error={detail.error} /> : detail.isLoading ? <LoadingRows rows={1} /> : detail.data && (
                            <FieldList
                                items={[
                                    ["Patient", detail.data.patientName],
                                    ["Status", detail.data.status],
                                    ["Hospital", detail.data.hospitalName],
                                    ["Needed by", formatDate(detail.data.neededBy, lang)],
                                    ["Units", `${detail.data.unitsFulfilled}/${detail.data.unitsNeeded}`],
                                    ["Accepted donors", detail.data.acceptedDonors.length],
                                ]}
                            />
                        )}
                    </ApiSection>
                    <ApiSection title="Status" description="GET /api/v1/requests/{id}/status">
                        {status.error ? <ErrorState error={status.error} /> : status.isLoading ? <LoadingRows rows={1} /> : <JsonPanel value={status.data} />}
                    </ApiSection>
                    <ApiSection title="Update request" description="PUT /api/v1/requests/{id}">
                        <form
                            className="grid gap-3 @2xl:grid-cols-2"
                            onSubmit={(event) => {
                                event.preventDefault()
                                const form = event.currentTarget
                                update.mutate({
                                    id,
                                    data: {
                                        patientName: formValue(form, "patientName"),
                                        patientAge: formNumber(form, "patientAge"),
                                        unitsNeeded: formNumber(form, "unitsNeeded"),
                                        hospitalName: formValue(form, "hospitalName"),
                                        urgency: formValue(form, "urgency") as never,
                                        neededBy: formValue(form, "neededBy"),
                                        notes: formValue(form, "notes"),
                                    },
                                })
                            }}
                        >
                            <TextField name="patientName" label="Patient name" defaultValue={detail.data?.patientName} />
                            <TextField name="patientAge" label="Patient age" type="number" defaultValue={detail.data?.patientAge ?? ""} />
                            <TextField name="unitsNeeded" label="Units needed" type="number" defaultValue={detail.data?.unitsNeeded} />
                            <TextField name="hospitalName" label="Hospital" defaultValue={detail.data?.hospitalName} />
                            <TextField name="urgency" label="Urgency" defaultValue={detail.data?.urgency} />
                            <TextField name="neededBy" label="Needed by" type="datetime-local" />
                            <div className="@2xl:col-span-2">
                                <TextAreaField name="notes" label="Notes" defaultValue={detail.data?.notes ?? ""} />
                            </div>
                            <div className="@2xl:col-span-2">
                                <SubmitButton pending={update.isPending}>Update request</SubmitButton>
                            </div>
                        </form>
                        {update.error && <ErrorState error={update.error} />}
                    </ApiSection>
                    <ApiSection title="Matches and completion" description="GET /matches, POST /confirm-completion, POST /matches/{donorId}/cancel">
                        {matches.error ? (
                            <ErrorState error={matches.error} />
                        ) : matches.isLoading ? (
                            <LoadingRows />
                        ) : matches.data?.length ? (
                            <div className="space-y-3">
                                {matches.data.map((match) => (
                                    <div key={match.id} className="rounded-lg border border-border bg-background p-3">
                                        <FieldList
                                            items={[
                                                ["Donor", match.donor.fullName],
                                                ["Phone", match.donor.phone],
                                                ["Status", match.status],
                                                ["Responded", formatDate(match.respondedAt, lang)],
                                            ]}
                                        />
                                        <Separator className="my-3" />
                                        <div className="flex flex-wrap gap-2">
                                            <Button size="sm" onClick={() => confirm.mutate({ id, data: { donorId: match.donor.id } })} disabled={confirm.isPending}>
                                                Confirm completion
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => cancelMatch.mutate({ id, donorId: match.donor.id, data: { cancelReason: "Cancelled from frontend" } })} disabled={cancelMatch.isPending}>
                                                Cancel match
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState />
                        )}
                        {(confirm.error || cancelMatch.error) && <ErrorState error={confirm.error ?? cancelMatch.error} />}
                    </ApiSection>
                </ApiGrid>
            </Container>
        </>
    )
}
