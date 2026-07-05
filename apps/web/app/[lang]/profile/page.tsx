import { Suspense } from "react"
import { connection } from "next/server"
import { RiUserSettingsLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardFooter } from "@workspace/ui/components/card"
import { Section } from "@workspace/ui/components/section"
import {
    BloodGroupOptions,
    FieldGroup,
    NativeSelectOption,
    SelectField,
    TextField,
} from "@/components/form-fields"
import { PrivateNav } from "@/components/private-nav"
import { updateProfileAction } from "@/lib/actions/private"
import { getLocations } from "@/lib/api/public-data"
import { getPrivateProfile } from "@/lib/api/private-data"
import { getDictionary } from "@/lib/i18n/dictionaries"
import type { Locale } from "@/lib/i18n/config"

interface ProfilePageProps {
    params: Promise<{ lang: Locale }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const { lang } = await params
    const dictionary = getDictionary(lang)

    return (
        <Section
            eyebrow={{ icon: <RiUserSettingsLine />, text: dictionary.nav.profile }}
            title="Account profile"
            description="Keep identity, blood group, language, and location details current."
            align="left"
        >
            <Suspense fallback={<div className="h-96 rounded-lg bg-muted" />}>
                <ProfileContent lang={lang} />
            </Suspense>
        </Section>
    )
}

async function ProfileContent({ lang }: { lang: Locale }) {
    await connection()
    const [user, locations] = await Promise.all([
        getPrivateProfile(lang),
        getLocations(),
    ])

    return (
        <div className="space-y-8">
            <PrivateNav lang={lang} role={user.role} />
            <Card className="max-w-3xl rounded-lg">
                <form action={updateProfileAction.bind(null, lang)}>
                    <CardContent className="p-6">
                        <FieldGroup>
                            <div className="grid gap-4 @2xl:grid-cols-2">
                                <TextField
                                    id="fullName"
                                    name="fullName"
                                    label="Full name"
                                    defaultValue={user.fullName}
                                    required
                                />
                                <TextField
                                    id="email"
                                    name="email"
                                    label="Email"
                                    type="email"
                                    defaultValue={user.email}
                                />
                                <SelectField
                                    id="bloodGroup"
                                    name="bloodGroup"
                                    label="Blood group"
                                    defaultValue={user.bloodGroup}
                                >
                                    <BloodGroupOptions />
                                </SelectField>
                                <SelectField
                                    id="preferredLanguage"
                                    name="preferredLanguage"
                                    label="Preferred language"
                                    defaultValue={user.preferredLanguage}
                                >
                                    <NativeSelectOption value="bn">
                                        Bangla
                                    </NativeSelectOption>
                                    <NativeSelectOption value="en">
                                        English
                                    </NativeSelectOption>
                                </SelectField>
                                <SelectField
                                    id="locationId"
                                    name="locationId"
                                    label="Location"
                                    defaultValue={user.locationId}
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
                            </div>
                        </FieldGroup>
                    </CardContent>
                    <CardFooter className="px-6 pb-6 pt-0">
                        <Button type="submit">Save profile</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
