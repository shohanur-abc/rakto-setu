import { Suspense } from "react"
import { connection } from "next/server"
import { RiUserHeartLine } from "@remixicon/react"
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
} from "@/components/form-fields"
import { registerDonorAction } from "@/lib/actions/private"
import { getLocations } from "@/lib/api/public-data"
import type { Locale } from "@/lib/i18n/config"

interface DonorRegisterPageProps {
    params: Promise<{ lang: Locale }>
}

export default async function DonorRegisterPage({
    params,
}: DonorRegisterPageProps) {
    const { lang } = await params

    return (
        <Section
            eyebrow={{ icon: <RiUserHeartLine />, text: "Donor" }}
            title="Register as donor"
            description="Create a donor profile for review and future matching."
            align="left"
        >
            <Suspense fallback={<div className="h-96 rounded-lg bg-muted" />}>
                <DonorRegisterForm lang={lang} />
            </Suspense>
        </Section>
    )
}

async function DonorRegisterForm({ lang }: { lang: Locale }) {
    await connection()
    const locations = await getLocations().catch(() => [])

    return (
        <Card className="max-w-3xl rounded-lg">
            <form action={registerDonorAction.bind(null, lang)}>
                <CardContent className="p-6">
                    <FieldGroup>
                        <div className="grid gap-4 @2xl:grid-cols-2">
                            <SelectField
                                id="bloodGroup"
                                name="bloodGroup"
                                label="Blood group"
                                required
                            >
                                <BloodGroupOptions />
                            </SelectField>
                            <SelectField
                                id="locationId"
                                name="locationId"
                                label="Location"
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
                            <TextField
                                id="lastDonationDate"
                                name="lastDonationDate"
                                label="Last donation date"
                                type="date"
                            />
                        </div>
                        <TextAreaField id="notes" name="notes" label="Notes" />
                    </FieldGroup>
                </CardContent>
                <CardFooter className="px-6 pb-6 pt-0">
                    <Button type="submit">Register donor profile</Button>
                </CardFooter>
            </form>
        </Card>
    )
}
