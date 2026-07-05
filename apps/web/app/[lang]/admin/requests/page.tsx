import { Suspense } from "react"
import { connection } from "next/server"
import { RiFileList3Line } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Section } from "@workspace/ui/components/section"
import { AppTable } from "@/components/app-table"
import {
    NativeSelectOption,
    SelectField,
    TextField,
} from "@/components/form-fields"
import { PrivateNav } from "@/components/private-nav"
import { RequestStatusBadge } from "@/components/request-status-badge"
import {
    assignDonorAction,
    closeRequestAction,
    publishRequestAction,
    rejectRequestAction,
} from "@/lib/actions/private"
import { getAdminRequests, getPrivateProfile } from "@/lib/api/private-data"
import type { Locale } from "@/lib/i18n/config"

interface AdminRequestsPageProps {
    params: Promise<{ lang: Locale }>
}

export default async function AdminRequestsPage({
    params,
}: AdminRequestsPageProps) {
    const { lang } = await params

    return (
        <Section
            eyebrow={{ icon: <RiFileList3Line />, text: "Admin" }}
            title="Requests"
            description="Publish, reject, assign donors, or close blood requests."
            align="left"
        >
            <Suspense fallback={<div className="h-96 rounded-lg bg-muted" />}>
                <AdminRequestsContent lang={lang} />
            </Suspense>
        </Section>
    )
}

async function AdminRequestsContent({ lang }: { lang: Locale }) {
    await connection()
    const [user, requests] = await Promise.all([
        getPrivateProfile(lang),
        getAdminRequests(lang, { limit: 50 }),
    ])

    return (
        <div className="space-y-8">
            <PrivateNav lang={lang} role={user.role} />
            <AppTable
                headers={["Patient", "Blood", "Hospital", "Status", "Actions"]}
                rows={requests.items.map((request) => [
                    request.patientName,
                    request.bloodGroup,
                    request.hospitalName,
                    <RequestStatusBadge key={request.id} status={request.status} />,
                    <div key={request.id} className="flex min-w-80 flex-wrap gap-2">
                        <form
                            action={publishRequestAction.bind(
                                null,
                                lang,
                                request.id
                            )}
                        >
                            <Button type="submit" size="sm">
                                Publish
                            </Button>
                        </form>
                        <form
                            action={rejectRequestAction.bind(
                                null,
                                lang,
                                request.id
                            )}
                        >
                            <Button type="submit" size="sm" variant="outline">
                                Reject
                            </Button>
                        </form>
                        <form
                            action={assignDonorAction.bind(null, lang, request.id)}
                            className="flex items-end gap-2"
                        >
                            <TextField
                                id={`donor-${request.id}`}
                                name="donorId"
                                label="Donor ID"
                            />
                            <Button type="submit" size="sm" variant="outline">
                                Assign
                            </Button>
                        </form>
                        <form
                            action={closeRequestAction.bind(null, lang, request.id)}
                            className="flex items-end gap-2"
                        >
                            <SelectField
                                id={`close-${request.id}`}
                                name="status"
                                label="Close as"
                                defaultValue="unfulfilled"
                            >
                                <NativeSelectOption value="fulfilled">
                                    fulfilled
                                </NativeSelectOption>
                                <NativeSelectOption value="expired">
                                    expired
                                </NativeSelectOption>
                                <NativeSelectOption value="unfulfilled">
                                    unfulfilled
                                </NativeSelectOption>
                                <NativeSelectOption value="cancelled">
                                    cancelled
                                </NativeSelectOption>
                            </SelectField>
                            <Button type="submit" size="sm" variant="outline">
                                Close
                            </Button>
                        </form>
                    </div>,
                ])}
            />
        </div>
    )
}
