import { useEffect, useState, type FormEvent } from "react"
import { toast } from "sonner"
import { RiSaveLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import { PageHeader } from "@/components/page-header"
import { DataState } from "@/components/data-state"
import { Spinner } from "@/components/spinner"
import { useProfile, useUpdateProfile } from "@/lib/api/hooks/use-profile"
import { useLocations } from "@/lib/api/public-data"
import { toErrorMessage } from "@/lib/api/error"
import { bloodGroupValues } from "@/lib/url/options"
import { useI18n } from "@/lib/i18n/context"
import type {
    UpdateProfileDtoBloodGroup,
    UserViewDto,
} from "@/lib/api/generated/rakto-setu"

export function ProfilePage() {
    const { dictionary } = useI18n()
    const t = dictionary.app.profile
    const f = dictionary.app.fields
    const query = useProfile()

    return (
        <>
            <PageHeader title={t.title} description={t.description} />
            <DataState
                isLoading={query.isLoading}
                isError={query.isError}
                onRetry={() => query.refetch()}
            >
                {query.data && (
                    <ProfileForm profile={query.data as unknown as UserViewDto} />
                )}
            </DataState>
        </>
    )

    function ProfileForm({ profile }: { profile: UserViewDto }) {
        const update = useUpdateProfile()
        const { data: locations = [] } = useLocations()
        const [bloodGroup, setBloodGroup] = useState(profile.bloodGroup ?? "")
        const [locationId, setLocationId] = useState(profile.locationId ?? "")
        const [language, setLanguage] = useState<string>(
            profile.preferredLanguage ?? "en"
        )

        // Keep local selects in sync if the profile query refetches.
        useEffect(() => {
            setBloodGroup(profile.bloodGroup ?? "")
            setLocationId(profile.locationId ?? "")
            setLanguage(profile.preferredLanguage ?? "en")
        }, [profile])

        const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            const form = new FormData(event.currentTarget)
            try {
                await update.mutateAsync({
                    fullName: String(form.get("fullName") ?? "").trim(),
                    email: String(form.get("email") ?? "").trim() || undefined,
                    bloodGroup:
                        (bloodGroup as UpdateProfileDtoBloodGroup) || undefined,
                    locationId: locationId || undefined,
                    preferredLanguage: language as "en" | "bn",
                })
                toast.success(t.updated)
            } catch (error) {
                toast.error(toErrorMessage(error))
            }
        }

        return (
            <Card className="max-w-2xl rounded-lg">
                <form onSubmit={handleSubmit}>
                    <CardContent className="p-6">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="fullName">
                                    {f.fullName}
                                </FieldLabel>
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    defaultValue={profile.fullName}
                                    required
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="phone">{f.phone}</FieldLabel>
                                <Input
                                    id="phone"
                                    value={profile.phone}
                                    disabled
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="email">{f.email}</FieldLabel>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    defaultValue={profile.email ?? ""}
                                />
                            </Field>
                            <Field>
                                <FieldLabel>{f.bloodGroup}</FieldLabel>
                                <Select
                                    value={bloodGroup || undefined}
                                    onValueChange={setBloodGroup}
                                >
                                    <SelectTrigger aria-label={f.bloodGroup}>
                                        <SelectValue
                                            placeholder={f.bloodGroup}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {bloodGroupValues.map((group) => (
                                            <SelectItem key={group} value={group}>
                                                {group}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field>
                                <FieldLabel>{f.area}</FieldLabel>
                                <Select
                                    value={locationId || undefined}
                                    onValueChange={setLocationId}
                                >
                                    <SelectTrigger aria-label={f.area}>
                                        <SelectValue placeholder={f.area} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locations.map((location) => (
                                            <SelectItem
                                                key={location.id}
                                                value={location.id}
                                            >
                                                {location.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field>
                                <FieldLabel>
                                    {dictionary.nav.language === "বাংলা"
                                        ? "Language"
                                        : "ভাষা / Language"}
                                </FieldLabel>
                                <Select
                                    value={language}
                                    onValueChange={setLanguage}
                                >
                                    <SelectTrigger aria-label="Language">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">
                                            English
                                        </SelectItem>
                                        <SelectItem value="bn">বাংলা</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Button
                                type="submit"
                                className="w-fit gap-2"
                                disabled={update.isPending}
                            >
                                {update.isPending ? (
                                    <Spinner />
                                ) : (
                                    <RiSaveLine className="size-4" />
                                )}
                                {dictionary.app.actions.save}
                            </Button>
                        </FieldGroup>
                    </CardContent>
                </form>
            </Card>
        )
    }
}
