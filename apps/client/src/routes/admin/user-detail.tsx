import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"
import { RiArrowLeftLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { PageHeader } from "@/components/page-header"
import { DataState } from "@/components/data-state"
import { BloodGroupBadge } from "@/components/blood-group-badge"
import {
    UserStatusBadge,
    VerificationBadge,
} from "@/components/status-badges"
import {
    useAdminUser,
    useUpdateUserStatus,
} from "@/lib/api/hooks/use-admin"
import { toErrorMessage } from "@/lib/api/error"
import { useI18n } from "@/lib/i18n/context"
import { formatDate } from "@/lib/format"

interface AdminUserDetail {
    id: string
    fullName: string
    phone: string
    email: string | null
    role: string
    status: string
    bloodGroup: string | null
    createdAt: string
    donorProfile?: {
        id: string
        bloodGroup: string
        isAvailable: boolean
        verification: string
        totalDonations: number
    } | null
}

export function AdminUserDetailPage() {
    const { id = "" } = useParams()
    const { dictionary, localePath } = useI18n()
    const t = dictionary.app.admin
    const f = dictionary.app.fields
    const query = useAdminUser(id)
    const updateStatus = useUpdateUserStatus()
    const user = query.data as unknown as AdminUserDetail | undefined

    const suspended = String(user?.status).toLowerCase() === "suspended"

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                asChild
                className="mb-2 -ml-2 gap-1"
            >
                <Link to={localePath("/admin/users")}>
                    <RiArrowLeftLine className="size-4" />
                    {t.usersTitle}
                </Link>
            </Button>

            <DataState
                isLoading={query.isLoading}
                isError={query.isError}
                onRetry={() => query.refetch()}
            >
                {user && (
                    <>
                        <PageHeader
                            title={user.fullName}
                            actions={
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={updateStatus.isPending}
                                    onClick={async () => {
                                        try {
                                            await updateStatus.mutateAsync({
                                                id: user.id,
                                                dto: {
                                                    status: suspended
                                                        ? "active"
                                                        : "suspended",
                                                },
                                            })
                                            toast.success(t.statusUpdated)
                                        } catch (error) {
                                            toast.error(toErrorMessage(error))
                                        }
                                    }}
                                >
                                    {suspended ? t.activate : t.suspend}
                                </Button>
                            }
                        />

                        <div className="grid gap-6 @2xl:grid-cols-2">
                            <Card className="rounded-lg">
                                <CardHeader>
                                    <h2 className="font-heading font-semibold">
                                        {t.userDetail}
                                    </h2>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Row label={f.phone} value={user.phone} />
                                    <Row
                                        label={f.email}
                                        value={user.email ?? "—"}
                                    />
                                    <Row
                                        label={f.role}
                                        value={String(user.role).toLowerCase()}
                                    />
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            {f.status}
                                        </span>
                                        <UserStatusBadge status={user.status} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            {f.bloodGroup}
                                        </span>
                                        {user.bloodGroup ? (
                                            <BloodGroupBadge
                                                bloodGroup={user.bloodGroup}
                                                size="sm"
                                            />
                                        ) : (
                                            <span>—</span>
                                        )}
                                    </div>
                                    <Separator />
                                    <Row
                                        label={f.created}
                                        value={formatDate(user.createdAt)}
                                    />
                                </CardContent>
                            </Card>

                            {user.donorProfile && (
                                <Card className="rounded-lg">
                                    <CardHeader>
                                        <h2 className="font-heading font-semibold">
                                            {dictionary.app.donor.title}
                                        </h2>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                {f.verification}
                                            </span>
                                            <VerificationBadge
                                                verification={
                                                    user.donorProfile
                                                        .verification
                                                }
                                            />
                                        </div>
                                        <Row
                                            label={dictionary.app.fields.availability}
                                            value={
                                                user.donorProfile.isAvailable
                                                    ? dictionary.app.donor
                                                          .available
                                                    : dictionary.app.donor
                                                          .unavailable
                                            }
                                        />
                                        <Row
                                            label={
                                                dictionary.app.donor
                                                    .totalDonations
                                            }
                                            value={String(
                                                user.donorProfile.totalDonations
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </>
                )}
            </DataState>
        </>
    )
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="font-medium capitalize">{value}</span>
        </div>
    )
}
