import { Link, useParams } from "react-router-dom"
import {
    RiArrowLeftLine,
    RiHospitalLine,
    RiMapPin2Line,
    RiTimeLine,
} from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { Section } from "@workspace/ui/components/section"
import { Separator } from "@workspace/ui/components/separator"
import { BloodGroupBadge } from "@/components/blood-group-badge"
import { UrgencyBadge } from "@/components/status-badges"
import { DataState } from "@/components/data-state"
import { usePublicRequest } from "@/lib/api/public-data"
import { useI18n } from "@/lib/i18n/context"
import { formatDate } from "@/lib/format"

export function PublicRequestDetailPage() {
    const { id = "" } = useParams()
    const { dictionary, localePath } = useI18n()
    const t = dictionary.requestsPage
    const query = usePublicRequest(id)
    const request = query.data

    return (
        <Section align="left" title={t.title}>
            <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 gap-1">
                <Link to={localePath("/requests/public")}>
                    <RiArrowLeftLine className="size-4" />
                    {dictionary.nav.activeRequests}
                </Link>
            </Button>

            <DataState
                isLoading={query.isLoading}
                isError={query.isError}
                onRetry={() => query.refetch()}
            >
                {request && (
                    <Card className="mx-auto max-w-2xl rounded-lg">
                        <CardHeader className="flex flex-row items-start justify-between gap-4">
                            <div className="space-y-1">
                                <h2 className="font-heading text-2xl font-bold">
                                    {request.patientName}
                                </h2>
                                <div className="flex gap-2">
                                    <UrgencyBadge urgency={request.urgency} />
                                </div>
                            </div>
                            <BloodGroupBadge
                                bloodGroup={request.bloodGroup}
                                size="lg"
                            />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Separator />
                            <dl className="grid gap-4 @2xl:grid-cols-2">
                                <Detail
                                    label={t.units}
                                    value={String(request.unitsNeeded)}
                                />
                                <Detail
                                    label={t.neededBy}
                                    value={formatDate(request.neededBy)}
                                    icon={<RiTimeLine className="size-4" />}
                                />
                                <Detail
                                    label={t.hospital}
                                    value={request.hospitalName}
                                    icon={<RiHospitalLine className="size-4" />}
                                />
                                {request.location?.name && (
                                    <Detail
                                        label={dictionary.common.location}
                                        value={request.location.name}
                                        icon={
                                            <RiMapPin2Line className="size-4" />
                                        }
                                    />
                                )}
                            </dl>
                            {request.notes && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">
                                            {t.notes}
                                        </p>
                                        <p className="text-sm leading-relaxed">
                                            {request.notes}
                                        </p>
                                    </div>
                                </>
                            )}
                            <p className="rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                                {t.publishedOnly}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </DataState>
        </Section>
    )
}

function Detail({
    label,
    value,
    icon,
}: {
    label: string
    value: string
    icon?: React.ReactNode
}) {
    return (
        <div>
            <dt className="text-xs font-medium uppercase text-muted-foreground">
                {label}
            </dt>
            <dd className="mt-0.5 flex items-center gap-1.5 font-medium">
                {icon}
                {value}
            </dd>
        </div>
    )
}
