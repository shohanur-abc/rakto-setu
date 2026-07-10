"use client"

import { useQueryClient } from "@tanstack/react-query"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
    getDonorsGetProfileQueryKey,
    useDonorsGetProfile,
    useDonorsRegister,
    useDonorsUpdateAvailability,
    useDonorsUpdateProfile,
} from "api-client/src/donors"
import { BLOOD_GROUPS } from "@/components/blood-group-badge"
import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { ApiSection, ErrorState, FieldList, LoadingRows, SubmitButton, TextAreaField, TextField, formValue } from "@/components/api-surface"
import { DonorTabs } from "./donor-tabs"

export function DonorConsoleClient({ lang }: { lang: string }) {
    const queryClient = useQueryClient()
    const profile = useDonorsGetProfile()
    const invalidateProfile = () => queryClient.invalidateQueries({ queryKey: getDonorsGetProfileQueryKey() })
    const register = useDonorsRegister({ mutation: { onSuccess: invalidateProfile } })
    const updateProfile = useDonorsUpdateProfile({ mutation: { onSuccess: invalidateProfile } })
    const availability = useDonorsUpdateAvailability({ mutation: { onSuccess: invalidateProfile } })

    return (
        <>
            <PageHeader eyebrow="Donor" title="Donor profile" subtitle="Profile, registration, and availability settings." />
            <DonorTabs lang={lang} />
            <Container className="grid gap-4 py-8 @2xl:py-10 @5xl:grid-cols-[0.95fr_1.05fr]">
                <ApiSection title="Current profile" description="Your donor identity, verification, and availability at a glance.">
                    {profile.error ? <ErrorState error={profile.error} /> : profile.isLoading ? <LoadingRows rows={1} /> : profile.data && (
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary">{profile.data.bloodGroup}</Badge>
                                <Badge variant={profile.data.isAvailable ? "default" : "secondary"}>{profile.data.isAvailable ? "Available" : "Unavailable"}</Badge>
                                <Badge variant="outline">{profile.data.verification}</Badge>
                            </div>
                            <FieldList
                                items={[
                                    ["Name", profile.data.fullName],
                                    ["Phone", profile.data.phone],
                                    ["Total donations", profile.data.totalDonations],
                                    ["Notes", typeof profile.data.notes === "string" ? profile.data.notes : profile.data.notes ? JSON.stringify(profile.data.notes) : "—"],
                                ]}
                            />
                        </div>
                    )}
                </ApiSection>
                <ApiSection title="Register or update" description="Keep your blood group, location, and notes current for better matches.">
                    <form
                        className="space-y-3"
                        onSubmit={(event) => {
                            event.preventDefault()
                            const form = event.currentTarget
                            register.mutate({
                                data: {
                                    bloodGroup: formValue(form, "bloodGroup") as never,
                                    lastDonationDate: formValue(form, "lastDonationDate"),
                                    notes: formValue(form, "notes"),
                                    locationId: formValue(form, "locationId"),
                                },
                            })
                        }}
                    >
                        <TextField name="bloodGroup" label={`Blood group (${BLOOD_GROUPS.join(", ")})`} defaultValue={profile.data?.bloodGroup ?? ""} />
                        <TextField name="lastDonationDate" label="Last donation date" type="date" />
                        <TextField name="locationId" label="Location id" />
                        <TextAreaField name="notes" label="Notes" defaultValue={String(profile.data?.notes ?? "")} />
                        <SubmitButton pending={register.isPending}>Register as donor</SubmitButton>
                    </form>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <Button onClick={() => updateProfile.mutate({ data: { bloodGroup: profile.data?.bloodGroup as never, notes: "Updated from frontend" } })} disabled={updateProfile.isPending} variant="outline">
                            Quick update profile
                        </Button>
                        <Button onClick={() => availability.mutate({ data: { isAvailable: !profile.data?.isAvailable } })} disabled={availability.isPending} variant="outline">
                            Toggle availability
                        </Button>
                    </div>
                    {(register.error || updateProfile.error || availability.error) && <div className="mt-3"><ErrorState error={register.error ?? updateProfile.error ?? availability.error} /></div>}
                </ApiSection>
            </Container>
        </>
    )
}
