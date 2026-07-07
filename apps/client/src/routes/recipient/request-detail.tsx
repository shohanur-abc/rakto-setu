import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import {
    RiArrowLeftLine,
    RiCheckLine,
    RiCloseCircleLine,
    RiEdit2Line,
    RiMailLine,
    RiPhoneLine,
} from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { Progress } from "@workspace/ui/components/progress"
import { Separator } from "@workspace/ui/components/separator"
import { BloodGroupBadge } from "@/components/blood-group-badge"
import { RequestStatusBadge, UrgencyBadge } from "@/components/status-badges"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { DataState } from "@/components/data-state"
import { PageHeader } from "@/components/page-header"
import {
    useCancelRequest,
    useConfirmRequestCompletion,
    useOwnRequest,
    useRequestMatches,
} from "@/lib/api/hooks/use-requests"
import { toErrorMessage } from "@/lib/api/error"
import { useI18n } from "@/lib/i18n/context"
import { formatDate, formatRelative } from "@/lib/format"

// Matches are loosely typed by the spec; model the shape the server returns.
interface MatchDonor {
    id: string
    status: string
    donorConfirmedCompletion: boolean
    recipientConfirmedCompletion: boolean
    respondedAt: string
    donor: {
        id: string
        fullName: string
        phone: string | null
        email: string | null
        bloodGroup: string | null
    }
}

export function RequestDetailPage() {
    const { id = "" } = useParams()
    const { dictionary, localePath } = useI18n()
    const t = dictionary.app.recipient
    const navigate = useNavigate()

    const query = useOwnRequest(id)
    const matchesQuery = useRequestMatches(id)
    const cancel = useCancelRequest(id)
    const confirm = useConfirmRequestCompletion(id)

    const request = query.data
    const matches = (matchesQuery.data ?? []) as unknown as MatchDonor[]
    const isClosed =
        request &&
        ["cancelled", "fulfilled", "expired", "unfulfilled"].includes(
            String(request.status).toLowerCase()
        )

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                asChild
                className="mb-2 -ml-2 gap-1"
            >
                <Link to={localePath("/requests")}>
                    <RiArrowLeftLine className="size-4" />
                    {t.requestsTitle}
                </Link>
            </Button>

            <DataState
                isLoading={query.isLoading}
                isError={query.isError}
                onRetry={() => query.refetch()}
            >
                {request && (
                    <>
                        <PageHeader
                            title={request.patientName}
                            actions={
                                !isClosed ? (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                            className="gap-1.5"
                                        >
                                            <Link
                                                to={localePath(
                                                    `/requests/${id}/edit`
                                                )}
                                            >
                                                <RiEdit2Line className="size-4" />
                                                {dictionary.app.actions.edit}
                                            </Link>
                                        </Button>
                                        <ConfirmDialog
                                            title={t.cancelConfirm}
                                            confirmLabel={
                                                dictionary.app.actions.confirm
                                            }
                                            onConfirm={async () => {
                                                try {
                                                    await cancel.mutateAsync()
                                                    toast.success(t.cancelled)
                                                    navigate(
                                                        localePath("/requests")
                                                    )
                                                } catch (error) {
                                                    toast.error(
                                                        toErrorMessage(error)
                                                    )
                                                }
                                            }}
                                            trigger={
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-1.5 text-destructive"
                                                >
                                                    <RiCloseCircleLine className="size-4" />
                                                    {
                                                        dictionary.app.actions
                                                            .cancel
                                                    }
                                                </Button>
                                            }
                                        />
                                    </div>
                                ) : undefined
                            }
                        />

                        <div className="grid gap-6 @5xl:grid-cols-[1.4fr_1fr]">
                            {/* Left: detail + progress */}
                            <div className="space-y-6">
                                <Card className="rounded-lg">
                                    <CardHeader className="flex flex-row items-start justify-between gap-3">
                                        <div className="flex flex-wrap gap-2">
                                            <RequestStatusBadge
                                                status={request.status}
                                            />
                                            <UrgencyBadge
                                                urgency={request.urgency}
                                            />
                                        </div>
                                        <BloodGroupBadge
                                            bloodGroup={request.bloodGroup}
                                            size="lg"
                                        />
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <div className="mb-1.5 flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    {request.unitsFulfilled}{" "}
                                                    {t.fulfilledOf}{" "}
                                                    {request.unitsNeeded}
                                                </span>
                                            </div>
                                            <Progress
                                                value={
                                                    (request.unitsFulfilled /
                                                        Math.max(
                                                            request.unitsNeeded,
                                                            1
                                                        )) *
                                                    100
                                                }
                                            />
                                        </div>
                                        <Separator />
                                        <dl className="grid gap-4 @2xl:grid-cols-2">
                                            <Detail
                                                label={
                                                    dictionary.app.fields
                                                        .hospital
                                                }
                                                value={request.hospitalName}
                                            />
                                            <Detail
                                                label={
                                                    dictionary.common.location
                                                }
                                                value={
                                                    request.location?.name ?? "—"
                                                }
                                            />
                                            <Detail
                                                label={
                                                    dictionary.app.fields
                                                        .neededBy
                                                }
                                                value={formatDate(
                                                    request.neededBy
                                                )}
                                            />
                                            {request.patientAge != null && (
                                                <Detail
                                                    label={
                                                        dictionary.app.fields
                                                            .patientAge
                                                    }
                                                    value={String(
                                                        request.patientAge
                                                    )}
                                                />
                                            )}
                                        </dl>
                                        {request.notes && (
                                            <>
                                                <Separator />
                                                <p className="text-sm leading-relaxed text-muted-foreground">
                                                    {request.notes}
                                                </p>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right: matched donors */}
                            <div className="space-y-3">
                                <h2 className="font-heading text-lg font-semibold">
                                    {t.matchesTitle}
                                </h2>
                                <DataState
                                    isLoading={matchesQuery.isLoading}
                                    isError={matchesQuery.isError}
                                    isEmpty={matches.length === 0}
                                    onRetry={() => matchesQuery.refetch()}
                                    emptyTitle={t.noMatches}
                                >
                                    <div className="flex flex-col gap-3">
                                        {matches.map((match) => (
                                            <Card
                                                key={match.id}
                                                className="rounded-lg"
                                            >
                                                <CardContent className="space-y-3 p-4">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-medium">
                                                            {match.donor.fullName}
                                                        </p>
                                                        {match.donor
                                                            .bloodGroup && (
                                                            <BloodGroupBadge
                                                                bloodGroup={
                                                                    match.donor
                                                                        .bloodGroup
                                                                }
                                                                size="sm"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="space-y-1 text-sm text-muted-foreground">
                                                        {match.donor.phone && (
                                                            <a
                                                                href={`tel:${match.donor.phone}`}
                                                                className="flex items-center gap-2 hover:text-foreground"
                                                            >
                                                                <RiPhoneLine className="size-4" />
                                                                {
                                                                    match.donor
                                                                        .phone
                                                                }
                                                            </a>
                                                        )}
                                                        {match.donor.email && (
                                                            <a
                                                                href={`mailto:${match.donor.email}`}
                                                                className="flex items-center gap-2 hover:text-foreground"
                                                            >
                                                                <RiMailLine className="size-4" />
                                                                {
                                                                    match.donor
                                                                        .email
                                                                }
                                                            </a>
                                                        )}
                                                        <p className="text-xs">
                                                            {formatRelative(
                                                                match.respondedAt
                                                            )}
                                                        </p>
                                                    </div>
                                                    {match.recipientConfirmedCompletion ? (
                                                        <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                                                            <RiCheckLine className="size-4" />
                                                            {t.confirmed}
                                                        </p>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="w-full gap-1.5"
                                                            disabled={
                                                                confirm.isPending
                                                            }
                                                            onClick={async () => {
                                                                try {
                                                                    await confirm.mutateAsync(
                                                                        {
                                                                            donorId:
                                                                                match
                                                                                    .donor
                                                                                    .id,
                                                                        }
                                                                    )
                                                                    toast.success(
                                                                        t.confirmed
                                                                    )
                                                                } catch (error) {
                                                                    toast.error(
                                                                        toErrorMessage(
                                                                            error
                                                                        )
                                                                    )
                                                                }
                                                            }}
                                                        >
                                                            <RiCheckLine className="size-4" />
                                                            {t.confirmCompletion}
                                                        </Button>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </DataState>
                            </div>
                        </div>
                    </>
                )}
            </DataState>
        </>
    )
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-xs font-medium uppercase text-muted-foreground">
                {label}
            </dt>
            <dd className="mt-0.5 font-medium">{value}</dd>
        </div>
    )
}
