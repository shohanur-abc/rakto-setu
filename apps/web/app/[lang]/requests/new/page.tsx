import { Suspense } from "react"
import { connection } from "next/server"
import { RiAddCircleLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardFooter } from "@workspace/ui/components/card"
import { Section } from "@workspace/ui/components/section"
import {
    BloodGroupOptions,
    FieldGroup,
    NativeSelectOption,
    SelectField,
    TextAreaField,
    TextField,
    UrgencyOptions,
} from "@/components/form-fields"
import { createRequestAction } from "@/lib/actions/private"
import { getLocations } from "@/lib/api/public-data"
import type { Locale } from "@/lib/i18n/config"

interface NewRequestPageProps {
    params: Promise<{ lang: Locale }>
}

export default async function NewRequestPage({ params }: NewRequestPageProps) {
    const { lang } = await params

    return (
        <Section
            eyebrow={{ icon: <RiAddCircleLine />, text: "Request" }}
            title="Create blood request"
            description="New requests enter pending review before they become public."
            align="left"
        >
            <Suspense fallback={<div className="h-96 rounded-lg bg-muted" />}>
                <NewRequestForm lang={lang} />
            </Suspense>
        </Section>
    )
}

async function NewRequestForm({ lang }: { lang: Locale }) {
    await connection()
    const locations = await getLocations().catch(() => [])

    return (
        <Card className="max-w-3xl rounded-lg">
            <form action={createRequestAction.bind(null, lang)}>
                <CardContent className="p-6">
                    <FieldGroup>
                        <div className="grid gap-4 @2xl:grid-cols-2">
                            <TextField
                                id="patientName"
                                name="patientName"
                                label="Patient name"
                                required
                            />
                            <TextField
                                id="patientAge"
                                name="patientAge"
                                label="Patient age"
                                type="number"
                                min={0}
                            />
                            <SelectField
                                id="bloodGroup"
                                name="bloodGroup"
                                label="Blood group"
                                required
                            >
                                <BloodGroupOptions />
                            </SelectField>
                            <TextField
                                id="unitsNeeded"
                                name="unitsNeeded"
                                label="Units needed"
                                type="number"
                                defaultValue={1}
                                min={1}
                            />
                            <TextField
                                id="hospitalName"
                                name="hospitalName"
                                label="Hospital"
                                required
                            />
                            <SelectField
                                id="locationId"
                                name="locationId"
                                label="Location"
                                required
                            >
                                <NativeSelectOption value="">
                                    Select
                                </NativeSelectOption>
                                {locations.map((location) => (
                                    <NativeSelectOption
                                        key={location.id}
                                        value={location.id}
                                    >
                                        {location.name}
                                    </NativeSelectOption>
                                ))}
                            </SelectField>
                            <SelectField
                                id="urgency"
                                name="urgency"
                                label="Urgency"
                                defaultValue="urgent"
                                required
                            >
                                <UrgencyOptions empty={false} />
                            </SelectField>
                            <TextField
                                id="neededBy"
                                name="neededBy"
                                label="Needed by"
                                type="datetime-local"
                                required
                            />
                        </div>
                        <TextAreaField id="notes" name="notes" label="Notes" />
                    </FieldGroup>
                </CardContent>
                <CardFooter className="px-6 pb-6 pt-0">
                    <Button type="submit">Submit for review</Button>
                </CardFooter>
            </form>
        </Card>
    )
}
