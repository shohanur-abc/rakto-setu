import { Link } from "react-router-dom"
import { RiHospitalLine, RiMapPin2Line, RiTimeLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { BloodGroupBadge } from "@/components/blood-group-badge"
import { RequestStatusBadge, UrgencyBadge } from "@/components/status-badges"
import { useI18n } from "@/lib/i18n/context"
import { formatDate } from "@/lib/format"
import type { BloodRequestViewDto } from "@/lib/api/generated/rakto-setu"

interface RequestCardProps {
    request: BloodRequestViewDto
    /** Link target for the detail button; omit to hide the action. */
    href?: string
    /** Show the internal status badge (own/admin views). Public hides it. */
    showStatus?: boolean
}

/** Shared summary card for a blood request across public, recipient, and admin
 * lists — keeps the request presentation identical everywhere. */
export function RequestCard({ request, href, showStatus }: RequestCardProps) {
    const { dictionary } = useI18n()
    const t = dictionary.requestsPage

    return (
        <Card className="rounded-lg">
            <CardContent className="flex flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                        <p className="font-heading text-lg font-semibold">
                            {request.patientName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {request.unitsNeeded} {t.units} · {t.neededBy}{" "}
                            {formatDate(request.neededBy)}
                        </p>
                    </div>
                    <BloodGroupBadge bloodGroup={request.bloodGroup} size="lg" />
                </div>

                <div className="flex flex-wrap gap-2">
                    <UrgencyBadge urgency={request.urgency} />
                    {showStatus && <RequestStatusBadge status={request.status} />}
                </div>

                <dl className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <RiHospitalLine className="size-4 shrink-0" />
                        <span>{request.hospitalName}</span>
                    </div>
                    {request.location?.name && (
                        <div className="flex items-center gap-2">
                            <RiMapPin2Line className="size-4 shrink-0" />
                            <span>{request.location.name}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <RiTimeLine className="size-4 shrink-0" />
                        <span>
                            {t.neededBy} {formatDate(request.neededBy)}
                        </span>
                    </div>
                </dl>

                {href && (
                    <Button variant="outline" size="sm" asChild className="mt-1">
                        <Link to={href}>{dictionary.common.viewDetails}</Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
