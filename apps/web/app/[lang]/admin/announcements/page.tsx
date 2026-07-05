import { Suspense } from "react"
import { connection } from "next/server"
import { RiMegaphoneLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardFooter } from "@workspace/ui/components/card"
import { Section } from "@workspace/ui/components/section"
import { AppEmpty } from "@/components/app-empty"
import { AppTable } from "@/components/app-table"
import { FieldGroup, TextAreaField, TextField } from "@/components/form-fields"
import { PrivateNav } from "@/components/private-nav"
import {
    createAnnouncementAction,
    deleteAnnouncementAction,
} from "@/lib/actions/private"
import { getPrivateProfile } from "@/lib/api/private-data"
import { getAnnouncements } from "@/lib/api/public-data"
import type { Locale } from "@/lib/i18n/config"

interface AdminAnnouncementsPageProps {
    params: Promise<{ lang: Locale }>
}

export default async function AdminAnnouncementsPage({
    params,
}: AdminAnnouncementsPageProps) {
    const { lang } = await params

    return (
        <Section
            eyebrow={{ icon: <RiMegaphoneLine />, text: "Admin" }}
            title="Announcements"
            description="Publish public announcements shown on the information pages."
            align="left"
        >
            <Suspense fallback={<div className="h-96 rounded-lg bg-muted" />}>
                <AdminAnnouncementsContent lang={lang} />
            </Suspense>
        </Section>
    )
}

async function AdminAnnouncementsContent({ lang }: { lang: Locale }) {
    await connection()
    const [user, announcements] = await Promise.all([
        getPrivateProfile(lang),
        getAnnouncements(),
    ])

    return (
        <div className="space-y-8">
            <PrivateNav lang={lang} role={user.role} />
            <Card className="max-w-3xl rounded-lg">
                <form action={createAnnouncementAction.bind(null, lang)}>
                    <CardContent className="p-6">
                        <FieldGroup>
                            <TextField
                                id="title"
                                name="title"
                                label="Title"
                                required
                            />
                            <TextAreaField id="body" name="body" label="Body" />
                            <label className="flex items-center gap-2 text-sm font-medium">
                                <input
                                    type="checkbox"
                                    name="isPublished"
                                    defaultChecked
                                />
                                Published
                            </label>
                        </FieldGroup>
                    </CardContent>
                    <CardFooter className="px-6 pb-6 pt-0">
                        <Button type="submit">Create announcement</Button>
                    </CardFooter>
                </form>
            </Card>
            {announcements.length === 0 ? (
                <AppEmpty>No public announcements yet.</AppEmpty>
            ) : (
                <AppTable
                    headers={["Title", "Published", "Created", "Action"]}
                    rows={announcements.map((announcement) => [
                        announcement.title,
                        announcement.isPublished ? "Yes" : "No",
                        new Date(announcement.createdAt).toLocaleDateString(
                            "en-BD"
                        ),
                        <form
                            key={announcement.id}
                            action={deleteAnnouncementAction.bind(
                                null,
                                lang,
                                announcement.id
                            )}
                        >
                            <Button type="submit" size="sm" variant="outline">
                                Delete
                            </Button>
                        </form>,
                    ])}
                />
            )}
        </div>
    )
}
