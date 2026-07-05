import { Suspense } from "react"
import { connection } from "next/server"
import { RiUserLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Section } from "@workspace/ui/components/section"
import { AppTable } from "@/components/app-table"
import { NativeSelectOption, SelectField } from "@/components/form-fields"
import { PrivateNav } from "@/components/private-nav"
import { updateUserStatusAction } from "@/lib/actions/private"
import { getAdminUsers, getPrivateProfile } from "@/lib/api/private-data"
import type { Locale } from "@/lib/i18n/config"

interface AdminUsersPageProps {
    params: Promise<{ lang: Locale }>
}

export default async function AdminUsersPage({ params }: AdminUsersPageProps) {
    const { lang } = await params

    return (
        <Section
            eyebrow={{ icon: <RiUserLine />, text: "Admin" }}
            title="Users"
            description="Review user accounts and update account status."
            align="left"
        >
            <Suspense fallback={<div className="h-96 rounded-lg bg-muted" />}>
                <AdminUsersContent lang={lang} />
            </Suspense>
        </Section>
    )
}

async function AdminUsersContent({ lang }: { lang: Locale }) {
    await connection()
    const [user, users] = await Promise.all([
        getPrivateProfile(lang),
        getAdminUsers(lang, { limit: 50 }),
    ])

    return (
        <div className="space-y-8">
            <PrivateNav lang={lang} role={user.role} />
            <AppTable
                headers={["Name", "Phone", "Role", "Status", "Action"]}
                rows={users.items.map((item) => [
                    item.fullName,
                    item.phone,
                    item.role,
                    item.status,
                    <form
                        key={item.id}
                        action={updateUserStatusAction.bind(null, lang, item.id)}
                        className="flex min-w-52 items-end gap-2"
                    >
                        <SelectField
                            id={`status-${item.id}`}
                            name="status"
                            label="Status"
                            defaultValue={item.status}
                        >
                            <NativeSelectOption value="active">
                                active
                            </NativeSelectOption>
                            <NativeSelectOption value="pending_verification">
                                pending_verification
                            </NativeSelectOption>
                            <NativeSelectOption value="suspended">
                                suspended
                            </NativeSelectOption>
                            <NativeSelectOption value="deleted">
                                deleted
                            </NativeSelectOption>
                        </SelectField>
                        <Button type="submit" size="sm">
                            Save
                        </Button>
                    </form>,
                ])}
            />
        </div>
    )
}
