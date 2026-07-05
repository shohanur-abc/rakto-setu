import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { BloodGroupBadge } from "@/components/blood-group-badge"
import { RiMapPinLine, RiShieldCheckLine, RiTimeLine } from "@remixicon/react"
import { cn } from "@workspace/ui/lib/utils"

export interface Donor {
    id: string
    fullName: string
    bloodGroup: string
    location?: { id: string; name: string } | null
    isAvailable?: boolean
    verification?: "unverified" | "verified" | "rejected"
    lastDonationDate?: string | null
    totalDonations: number
}

interface DonorCardProps {
    donor: Donor
    labels?: {
        verified?: string
        available?: string
        unavailable?: string
        lastDonated?: string
        totalDonations?: string
    }
    className?: string
}

export function DonorCard({ donor, labels, className }: DonorCardProps) {
    const lastDonated = donor.lastDonationDate
        ? new Date(donor.lastDonationDate).toLocaleDateString("en-BD", {
              dateStyle: "medium",
          })
        : null

    return (
        <Card
            className={cn(
                "rounded-xl transition-shadow hover:shadow-md",
                className
            )}
        >
            <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <p className="font-semibold leading-tight">
                            {donor.fullName}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <BloodGroupBadge
                                bloodGroup={donor.bloodGroup}
                                size="sm"
                            />
                            {(donor.verification ?? "verified") === "verified" && (
                                <Badge
                                    variant="outline"
                                    className="inline-flex items-center gap-1 bg-emerald-100 text-xs text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                >
                                    <RiShieldCheckLine className="size-3" />
                                    {labels?.verified ?? "Verified"}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Availability dot */}
                    <span
                        className={cn(
                            "mt-1 size-2.5 shrink-0 rounded-full",
                            (donor.isAvailable ?? true)
                                ? "bg-emerald-500" // green — medically meaningful
                                : "bg-muted-foreground"
                        )}
                        title={
                            (donor.isAvailable ?? true)
                                ? (labels?.available ?? "Available")
                                : (labels?.unavailable ?? "Unavailable")
                        }
                    />
                </div>

                {/* Location */}
                {donor.location && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <RiMapPinLine className="size-4 shrink-0" />
                        <span>{donor.location.name}</span>
                    </div>
                )}

                {/* Last donation */}
                {lastDonated && (
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <RiTimeLine className="size-4 shrink-0" />
                    <span>
                        {labels?.lastDonated ?? "Last donated"}: {lastDonated}
                    </span>
                    </div>
                )}

                {/* Total donations */}
                <p className="mt-3 text-xs text-muted-foreground">
                    {donor.totalDonations}{" "}
                    {labels?.totalDonations ?? "donations total"}
                </p>
            </CardContent>
        </Card>
    )
}
