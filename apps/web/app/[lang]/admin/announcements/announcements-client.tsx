"use client"

import { RiMegaphoneLine } from "@remixicon/react"
import { Badge } from "@workspace/ui/components/badge"
import {
    useAdminCreateAnnouncement,
    useAdminDeleteAnnouncement,
    useAdminUpdateAnnouncement,
} from "api-client/src/admin"
import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { ErrorState, JsonPanel, SubmitButton, TextAreaField, TextField, formValue } from "@/components/api-surface"
import { AdminTabs } from "../admin-tabs"

export function AdminAnnouncementsClient({ lang }: { lang: string }) {
    const createAnnouncement = useAdminCreateAnnouncement()
    const updateAnnouncement = useAdminUpdateAnnouncement()
    const deleteAnnouncement = useAdminDeleteAnnouncement()

    return (
        <>
            <PageHeader eyebrow="Admin" title="Announcements" subtitle="Publish concise public updates and manage existing announcement records." />
            <AdminTabs lang={lang} />
            <Container className="grid gap-6 py-8 @2xl:py-10 @6xl:grid-cols-[minmax(0,1fr)_380px]">
                <section className="rounded-lg border border-border bg-card p-5">
                    <div className="mb-5 flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <RiMegaphoneLine className="size-5" aria-hidden="true" />
                        </span>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Create announcement</h2>
                            <p className="text-sm text-muted-foreground">Keep the message short and actionable for public readers.</p>
                        </div>
                    </div>
                    <form
                        className="space-y-3"
                        onSubmit={(event) => {
                            event.preventDefault()
                            const form = event.currentTarget
                            createAnnouncement.mutate({ data: { title: formValue(form, "title") ?? "", body: formValue(form, "body") ?? "", isPublished: true } })
                        }}
                    >
                        <TextField name="title" label="Title" required />
                        <TextAreaField name="body" label="Body" />
                        <SubmitButton pending={createAnnouncement.isPending}>Create announcement</SubmitButton>
                    </form>
                    {createAnnouncement.data && (
                        <div className="mt-4 rounded-lg border border-border bg-background p-4">
                            <div className="mb-2 flex items-center gap-2">
                                <Badge variant={createAnnouncement.data.isPublished ? "default" : "secondary"}>{createAnnouncement.data.isPublished ? "Published" : "Draft"}</Badge>
                                <span className="text-xs text-muted-foreground">{createAnnouncement.data.id}</span>
                            </div>
                            <h3 className="font-semibold text-foreground">{createAnnouncement.data.title}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">{createAnnouncement.data.body}</p>
                        </div>
                    )}
                </section>
                <aside className="space-y-5">
                    <form
                        className="space-y-3 rounded-lg border border-border bg-card p-5"
                        onSubmit={(event) => {
                            event.preventDefault()
                            const form = event.currentTarget
                            updateAnnouncement.mutate({ id: formValue(form, "id") ?? "", data: { title: formValue(form, "title"), body: formValue(form, "body"), isPublished: true } })
                        }}
                    >
                        <h2 className="text-lg font-semibold text-foreground">Update announcement</h2>
                        <TextField name="id" label="Announcement id" required />
                        <TextField name="title" label="New title" />
                        <TextAreaField name="body" label="New body" />
                        <SubmitButton pending={updateAnnouncement.isPending} variant="outline">Update announcement</SubmitButton>
                        {updateAnnouncement.data && <JsonPanel value={updateAnnouncement.data} />}
                    </form>
                    <form
                        className="space-y-3 rounded-lg border border-border bg-card p-5"
                        onSubmit={(event) => {
                            event.preventDefault()
                            deleteAnnouncement.mutate({ id: formValue(event.currentTarget, "id") ?? "" })
                        }}
                    >
                        <h2 className="text-lg font-semibold text-foreground">Delete announcement</h2>
                        <TextField name="id" label="Announcement id" required />
                        <SubmitButton pending={deleteAnnouncement.isPending} variant="destructive">Delete announcement</SubmitButton>
                    </form>
                    {(createAnnouncement.error || updateAnnouncement.error || deleteAnnouncement.error) && <ErrorState error={createAnnouncement.error ?? updateAnnouncement.error ?? deleteAnnouncement.error} />}
                </aside>
            </Container>
        </>
    )
}
