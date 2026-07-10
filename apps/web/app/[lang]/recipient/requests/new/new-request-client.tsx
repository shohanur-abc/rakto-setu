"use client"

import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { getRequestsListOwnQueryKey, useRequestsCreate } from "api-client/src/requests"
import { BLOOD_GROUPS } from "@/components/blood-group-badge"
import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { ApiSection, ErrorState, JsonPanel, SubmitButton, TextAreaField, TextField, formNumber, formValue } from "@/components/api-surface"
import { RecipientTabs } from "../../recipient-tabs"

const ownParams = { page: 1, limit: 50 }

export function RecipientNewRequestClient({ lang }: { lang: string }) {
    const router = useRouter()
    const queryClient = useQueryClient()
    const create = useRequestsCreate({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: getRequestsListOwnQueryKey(ownParams) })
                router.push(`/${lang}/recipient/requests`)
            },
        },
    })

    return (
        <>
            <PageHeader eyebrow="Recipient" title="Create request" subtitle="Create a blood request for admin review." />
            <RecipientTabs lang={lang} />
            <Container className="max-w-3xl py-8 @2xl:py-10">
                <ApiSection title="Request details" description="Add the patient, hospital, timing, and blood requirements for review.">
                    <form
                        className="grid gap-3 @2xl:grid-cols-2"
                        onSubmit={(event) => {
                            event.preventDefault()
                            const form = event.currentTarget
                            create.mutate({
                                data: {
                                    patientName: formValue(form, "patientName") ?? "",
                                    patientAge: formNumber(form, "patientAge"),
                                    bloodGroup: formValue(form, "bloodGroup") as never,
                                    locationId: formValue(form, "locationId") ?? "",
                                    unitsNeeded: formNumber(form, "unitsNeeded"),
                                    hospitalName: formValue(form, "hospitalName") ?? "",
                                    urgency: formValue(form, "urgency") as never,
                                    neededBy: formValue(form, "neededBy") ?? "",
                                    notes: formValue(form, "notes"),
                                },
                            })
                        }}
                    >
                        <TextField name="patientName" label="Patient name" required />
                        <TextField name="patientAge" label="Patient age" type="number" />
                        <TextField name="bloodGroup" label={`Blood group (${BLOOD_GROUPS.join(", ")})`} required />
                        <TextField name="locationId" label="Location id" required />
                        <TextField name="unitsNeeded" label="Units needed" type="number" defaultValue={1} />
                        <TextField name="hospitalName" label="Hospital" required />
                        <TextField name="urgency" label="Urgency (routine, urgent, emergency)" required defaultValue="urgent" />
                        <TextField name="neededBy" label="Needed by" type="datetime-local" required />
                        <div className="@2xl:col-span-2">
                            <TextAreaField name="notes" label="Notes" />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 @2xl:col-span-2">
                            <SubmitButton pending={create.isPending}>Create request</SubmitButton>
                        </div>
                    </form>
                    {create.error && <div className="mt-4"><ErrorState error={create.error} /></div>}
                    {create.data && <div className="mt-4"><JsonPanel value={create.data} /></div>}
                </ApiSection>
            </Container>
        </>
    )
}
