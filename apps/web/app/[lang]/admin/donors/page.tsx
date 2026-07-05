import { Suspense } from "react"
import { connection } from "next/server"
import { RiUserHeartLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Section } from "@workspace/ui/components/section"
import { AppEmpty } from "@/components/app-empty"
import { AppTable } from "@/components/app-table"
import { NativeSelectOption, SelectField } from "@/components/form-fields"
import { PrivateNav } from "@/components/private-nav"
import { verifyDonorAction } from "@/lib/actions/private"
import {
    getAdminPendingDonors,
    getPrivateProfile,
} from "@/lib/api/private-data"
import type { Locale } from "@/lib/i18n/config"

interface AdminDonorsPageProps {
    params: Promise<{ lang: Locale }>
}

export default async function AdminDonorsPage({ params }: AdminDonorsPageProps) {
    const { lang } = await params

    return (
        <Section
            eyebrow={{ icon: <RiUserHeartLine />, text: "Admin" }}
            title="Pending donors"
            description="Approve or reject donor profiles after review."
            align="left"
        >
            <Suspense fallback={<div className="h-80 rounded-lg bg-muted" />}>
                <AdminDonorsContent lang={lang} />
            </Suspense>
        </Section>
    )
}

async function AdminDonorsContent({ lang }: { lang: Locale }) {
    await connection()
    const [user, donors] = await Promise.all([
        getPrivateProfile(lang),
        getAdminPendingDonors(lang),
    ])

    return (
        <div className="space-y-8">
            <PrivateNav lang={lang} role={user.role} />
            {donors.length === 0 ? (
                <AppEmpty>No donor profiles are pending review.</AppEmpty>
            ) : (
                <AppTable
                    headers={["Name", "Phone", "Blood", "Created", "Action"]}
                    rows={donors.map((donor) => [
                        donor.fullName,
                        donor.phone,
                        donor.bloodGroup,
                        new Date(donor.createdAt).toLocaleDateString("en-BD"),
                        <form
                            key={donor.id}
                            action={verifyDonorAction.bind(null, lang, donor.id)}
                            className="flex min-w-52 items-end gap-2"
                        >
                            <SelectField
                                id={`verification-${donor.id}`}
                                name="verification"
                                label="Decision"
                                defaultValue={donor.verification}
                            >
                                <NativeSelectOption value="verified">
                                    verified
                                </NativeSelectOption>
                                <NativeSelectOption value="rejected">
                                    rejected
                                </NativeSelectOption>
                            </SelectField>
                            <Button type="submit" size="sm">
                                Save
                            </Button>
                        </form>,
                    ])}
                />
            )}
        </div>
    )
}
