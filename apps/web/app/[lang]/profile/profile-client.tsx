"use client"

import { useQueryClient } from "@tanstack/react-query"
import {
    getUsersGetProfileQueryKey,
    useUsersGetProfile,
    useUsersUpdateProfile,
    useUsersUploadAvatar,
} from "api-client/src/users"
import { BLOOD_GROUPS } from "@/components/blood-group-badge"
import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { ApiGrid, ApiSection, ErrorState, FieldList, JsonPanel, SubmitButton, TextField, formValue } from "@/components/api-surface"

export function ProfileClient({ lang }: { lang: string }) {
    const queryClient = useQueryClient()
    const profile = useUsersGetProfile()
    const update = useUsersUpdateProfile({
        mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getUsersGetProfileQueryKey() }) },
    })
    const avatar = useUsersUploadAvatar()

    return (
        <>
            <PageHeader eyebrow="Profile" title="User profile" subtitle="View, update, and upload avatar for the current user." />
            <Container className="space-y-4 py-10 @2xl:py-12">
                <ApiSection title="Current profile" description="GET /api/v1/users/profile">
                    {profile.error ? <ErrorState error={profile.error} /> : profile.isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : profile.data && (
                        <FieldList
                            items={[
                                ["Name", profile.data.fullName],
                                ["Phone", profile.data.phone],
                                ["Email", profile.data.email ?? "—"],
                                ["Role", profile.data.role],
                                ["Blood group", profile.data.bloodGroup ?? "—"],
                                ["Language", profile.data.preferredLanguage],
                            ]}
                        />
                    )}
                </ApiSection>
                <ApiGrid>
                    <ApiSection title="Update profile" description="PUT /api/v1/users/profile">
                        <form
                            className="space-y-3"
                            onSubmit={(event) => {
                                event.preventDefault()
                                const form = event.currentTarget
                                update.mutate({
                                    data: {
                                        fullName: formValue(form, "fullName"),
                                        email: formValue(form, "email"),
                                        bloodGroup: formValue(form, "bloodGroup") as never,
                                        locationId: formValue(form, "locationId"),
                                        preferredLanguage: (formValue(form, "preferredLanguage") ?? lang) as never,
                                    },
                                })
                            }}
                        >
                            <TextField name="fullName" label="Full name" defaultValue={profile.data?.fullName} />
                            <TextField name="email" label="Email" type="email" defaultValue={profile.data?.email ?? ""} />
                            <TextField name="bloodGroup" label={`Blood group (${BLOOD_GROUPS.join(", ")})`} defaultValue={profile.data?.bloodGroup ?? ""} />
                            <TextField name="locationId" label="Location id" defaultValue={profile.data?.locationId ?? ""} />
                            <TextField name="preferredLanguage" label="Preferred language" defaultValue={profile.data?.preferredLanguage ?? lang} />
                            <SubmitButton pending={update.isPending}>Save profile</SubmitButton>
                        </form>
                        {update.error && <ErrorState error={update.error} />}
                        {update.data && <JsonPanel value={update.data} />}
                    </ApiSection>
                    <ApiSection title="Upload avatar" description="POST /api/v1/users/profile/avatar">
                        <form
                            className="space-y-3"
                            onSubmit={(event) => {
                                event.preventDefault()
                                avatar.mutate()
                            }}
                        >
                            <p className="text-sm text-muted-foreground">
                                The generated client currently exposes this endpoint without a file variable, so this submits the endpoint as generated.
                            </p>
                            <SubmitButton pending={avatar.isPending}>Upload avatar</SubmitButton>
                        </form>
                        {avatar.error && <ErrorState error={avatar.error} />}
                        {avatar.data && <JsonPanel value={avatar.data} />}
                    </ApiSection>
                </ApiGrid>
            </Container>
        </>
    )
}
