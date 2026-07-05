import { Suspense } from "react"
import { connection } from "next/server"
import { RiSettings3Line } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardFooter } from "@workspace/ui/components/card"
import { Section } from "@workspace/ui/components/section"
import { FieldGroup, TextField } from "@/components/form-fields"
import { PrivateNav } from "@/components/private-nav"
import { updateSettingsAction } from "@/lib/actions/private"
import { getAdminSettings, getPrivateProfile } from "@/lib/api/private-data"
import type { Locale } from "@/lib/i18n/config"

interface AdminSettingsPageProps {
    params: Promise<{ lang: Locale }>
}

export default async function AdminSettingsPage({
    params,
}: AdminSettingsPageProps) {
    const { lang } = await params

    return (
        <Section
            eyebrow={{ icon: <RiSettings3Line />, text: "Admin" }}
            title="Settings"
            description="Configure operational defaults used by request and donor workflows."
            align="left"
        >
            <Suspense fallback={<div className="h-80 rounded-lg bg-muted" />}>
                <AdminSettingsContent lang={lang} />
            </Suspense>
        </Section>
    )
}

async function AdminSettingsContent({ lang }: { lang: Locale }) {
    await connection()
    const [user, settings] = await Promise.all([
        getPrivateProfile(lang),
        getAdminSettings(lang),
    ])

    return (
        <div className="space-y-8">
            <PrivateNav lang={lang} role={user.role} />
            <Card className="max-w-xl rounded-lg">
                <form action={updateSettingsAction.bind(null, lang)}>
                    <CardContent className="p-6">
                        <FieldGroup>
                            <TextField
                                id="donorCooldownDays"
                                name="donorCooldownDays"
                                label="Donor cooldown days"
                                type="number"
                                min={1}
                                defaultValue={settings.donorCooldownDays}
                            />
                        </FieldGroup>
                    </CardContent>
                    <CardFooter className="px-6 pb-6 pt-0">
                        <Button type="submit">Save settings</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
