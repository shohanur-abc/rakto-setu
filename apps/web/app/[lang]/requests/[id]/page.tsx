import { Suspense } from "react"
import { connection } from "next/server"
import { RiCheckboxCircleLine, RiFileList3Line } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardFooter } from "@workspace/ui/components/card"
import { Section } from "@workspace/ui/components/section"
import {
    FieldGroup,
    TextAreaField,
    TextField,
    UrgencyOptions,
    SelectField,
} from "@/components/form-fields"
import { AppEmpty } from "@/components/app-empty"
import { AppTable } from "@/components/app-table"
import { RequestStatusBadge } from "@/components/request-status-badge"
import {
    cancelRequestAction,
    confirmRecipientCompletionAction,
    updateRequestAction,
} from "@/lib/actions/private"
import {
    getOwnRequest,
    getOwnRequestMatches,
    getOwnRequestStatus,
} from "@/lib/api/private-data"
import type { Locale } from "@/lib/i18n/config"

interface RequestDetailPageProps {
    params: Promise<{ lang: Locale; id: string }>
}

export default function RequestDetailPage({ params }: RequestDetailPageProps) {
    return (
        <Section
            eyebrow={{ icon: <RiFileList3Line />, text: "Recipient" }}
            title="Request detail"
            description="Review request status, accepted donor contacts, and completion."
            align="left"
        >
            <Suspense fallback={<div className="h-96 rounded-lg bg-muted" />}>
                <RequestDetailContent params={params} />
            </Suspense>
        </Section>
    )
}

async function RequestDetailContent({ params }: RequestDetailPageProps) {
    await connection()
    const { lang, id } = await params
    const [request, status, matches] = await Promise.all([
        getOwnRequest(lang, id),
        getOwnRequestStatus(lang, id),
        getOwnRequestMatches(lang, id),
    ])

    return (
        <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1fr)_360px]">
            <Card className="rounded-lg">
                <form action={updateRequestAction.bind(null, lang, id)}>
                    <CardContent className="p-6">
                        <div className="mb-6 flex flex-wrap items-center gap-3">
                            <RequestStatusBadge status={request.status} />
                            <span className="text-sm text-muted-foreground">
                                {status.unitsFulfilled} of {status.unitsNeeded} units
                                fulfilled
                            </span>
                        </div>
                        <FieldGroup>
                            <div className="grid gap-4 @2xl:grid-cols-2">
                                <TextField
                                    id="patientName"
                                    name="patientName"
                                    label="Patient name"
                                    defaultValue={request.patientName}
                                />
                                <TextField
                                    id="patientAge"
                                    name="patientAge"
                                    label="Patient age"
                                    type="number"
                                    min={0}
                                    defaultValue={request.patientAge}
                                />
                                <TextField
                                    id="unitsNeeded"
                                    name="unitsNeeded"
                                    label="Units needed"
                                    type="number"
                                    min={1}
                                    defaultValue={request.unitsNeeded}
                                />
                                <TextField
                                    id="hospitalName"
                                    name="hospitalName"
                                    label="Hospital"
                                    defaultValue={request.hospitalName}
                                />
                                <SelectField
                                    id="urgency"
                                    name="urgency"
                                    label="Urgency"
                                    defaultValue={request.urgency}
                                >
                                    <UrgencyOptions empty={false} />
                                </SelectField>
                                <TextField
                                    id="neededBy"
                                    name="neededBy"
                                    label="Needed by"
                                    type="datetime-local"
                                    defaultValue={toDateTimeLocal(request.neededBy)}
                                />
                            </div>
                            <TextAreaField
                                id="notes"
                                name="notes"
                                label="Notes"
                                defaultValue={request.notes}
                            />
                        </FieldGroup>
                    </CardContent>
                    <CardFooter className="flex flex-wrap gap-3 px-6 pb-6 pt-0">
                        <Button type="submit">Save changes</Button>
                    </CardFooter>
                </form>
            </Card>

            <div className="space-y-6">
                <Card className="rounded-lg">
                    <CardContent className="space-y-3 p-5">
                        <h2 className="font-semibold">Lifecycle</h2>
                        <p className="text-sm text-muted-foreground">
                            Current status: {status.status}
                        </p>
                        <form action={cancelRequestAction.bind(null, lang, id)}>
                            <Button variant="outline" type="submit">
                                Cancel request
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="rounded-lg">
                    <CardContent className="space-y-4 p-5">
                        <div className="flex items-center gap-2">
                            <RiCheckboxCircleLine className="size-5 text-primary" />
                            <h2 className="font-semibold">Accepted donors</h2>
                        </div>
                        {matches.length === 0 ? (
                            <AppEmpty>No accepted donors yet.</AppEmpty>
                        ) : (
                            <AppTable
                                headers={[
                                    "Donor",
                                    "Contact",
                                    "Status",
                                    "Completion",
                                ]}
                                rows={matches.map((match) => [
                                    `${match.donor.fullName} (${match.donor.bloodGroup ?? "N/A"})`,
                                    match.donor.phone,
                                    match.status,
                                    <form
                                        key={match.id}
                                        action={confirmRecipientCompletionAction.bind(
                                            null,
                                            lang,
                                            id
                                        )}
                                        className="flex gap-2"
                                    >
                                        <input
                                            type="hidden"
                                            name="donorId"
                                            value={match.donor.id}
                                        />
                                        <Button
                                            type="submit"
                                            size="sm"
                                            variant="outline"
                                            disabled={
                                                match.recipientConfirmedCompletion
                                            }
                                        >
                                            {match.recipientConfirmedCompletion
                                                ? "Confirmed"
                                                : "Confirm"}
                                        </Button>
                                    </form>,
                                ])}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function toDateTimeLocal(value: string) {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return ""
    }

    return date.toISOString().slice(0, 16)
}
