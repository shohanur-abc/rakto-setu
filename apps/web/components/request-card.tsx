import Link from "next/link"
import { Card, CardContent, CardFooter } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import { BloodGroupBadge } from "@/components/blood-group-badge"
import { UrgencyBadge } from "@/components/urgency-badge"
import { RequestStatusBadge } from "@/components/request-status-badge"
import {
    RiHospitalLine,
    RiMapPinLine,
    RiTimeLine,
    RiUser3Line,
} from "@remixicon/react"
import { cn } from "@workspace/ui/lib/utils"

export interface BloodRequest {
    id: string
    patientName: string
    patientAge?: number | null
    bloodGroup: string
    unitsNeeded: number
    unitsFulfilled: number
    hospitalName: string
    location?: { id: string; name: string } | null
    urgency: string
    neededBy: string
    status: string
    notes?: string | null
    createdAt: string
}

interface RequestCardProps {
    request: BloodRequest
    /** href for the card's view button; defaults to /requests/{id} */
    href?: string
    /** Show status badge (hidden on public board by default) */
    showStatus?: boolean
    labels?: {
        viewDetails?: string
        units?: string
        neededBy?: string
        overdue?: string
    }
    className?: string
}

export function RequestCard({
    request,
    href,
    showStatus = false,
    labels,
    className,
}: RequestCardProps) {
    const viewHref = href ?? `/requests/${request.id}`
    const neededByDate = new Date(request.neededBy)
    const isOverdue = neededByDate < new Date()

    return (
        <Card
            className={cn(
                "flex flex-col rounded-xl transition-shadow hover:shadow-md",
                className
            )}
        >
            <CardContent className="flex-1 p-5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <BloodGroupBadge bloodGroup={request.bloodGroup} size="lg" />
                        <UrgencyBadge urgency={request.urgency} />
                        {showStatus && (
                            <RequestStatusBadge status={request.status} />
                        )}
                    </div>
                    <span className="shrink-0 text-sm font-medium text-muted-foreground">
                        {request.unitsNeeded} {labels?.units ?? "units"}
                    </span>
                </div>

                <Separator className="my-4" />

                {/* Patient */}
                <div className="flex items-center gap-2 text-sm">
                    <RiUser3Line className="size-4 shrink-0 text-muted-foreground" />
                    <span className="font-medium">{request.patientName}</span>
                    {request.patientAge && (
                        <span className="text-muted-foreground">
                            · {request.patientAge} yrs
                        </span>
                    )}
                </div>

                {/* Hospital */}
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <RiHospitalLine className="size-4 shrink-0" />
                    <span>{request.hospitalName}</span>
                </div>

                {/* Location */}
                {request.location && (
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <RiMapPinLine className="size-4 shrink-0" />
                        <span>{request.location.name}</span>
                    </div>
                )}

                {/* Needed by */}
                <div
                    className={cn(
                        "mt-2 flex items-center gap-2 text-sm",
                        isOverdue
                            ? "text-red-600 dark:text-red-400" // medically meaningful — must not follow theme
                            : "text-muted-foreground"
                    )}
                >
                    <RiTimeLine className="size-4 shrink-0" />
                    <span>
                        {labels?.neededBy ?? "Needed by"}{" "}
                        {neededByDate.toLocaleDateString("en-BD", {
                            dateStyle: "medium",
                        })}
                        {isOverdue && ` · ${labels?.overdue ?? "Overdue"}`}
                    </span>
                </div>
            </CardContent>

            <CardFooter className="px-5 pb-5 pt-0">
                <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={viewHref} id={`view-request-${request.id}`}>
                        {labels?.viewDetails ?? "View Details"}
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
