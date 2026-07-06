import { toast } from "sonner"
import {
    RiCheckboxCircleLine,
    RiCloseCircleLine,
    RiDropLine,
    RiHeartPulseLine,
} from "@remixicon/react"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Switch } from "@workspace/ui/components/switch"
import { PageHeader } from "@/components/page-header"
import { DataState } from "@/components/data-state"
import { BloodGroupBadge } from "@/components/blood-group-badge"
import { VerificationBadge } from "@/components/status-badges"
import {
    useDonorEligibility,
    useDonorProfile,
    useUpdateAvailability,
} from "@/lib/api/hooks/use-donor"
import { toErrorMessage } from "@/lib/api/error"
import { useI18n } from "@/lib/i18n/context"
import { formatDate } from "@/lib/format"
import type { DonorEligibility, DonorProfile } from "@/routes/donor/types"

export function DonorOverviewPage() {
    const { dictionary } = useI18n()
    const t = dictionary.app.donor
    const profileQuery = useDonorProfile()
    const eligibilityQuery = useDonorEligibility()
    const availability = useUpdateAvailability()

    const profile = profileQuery.data as unknown as DonorProfile | undefined
    const eligibility = eligibilityQuery.data as unknown as
        | DonorEligibility
        | undefined

    const toggleAvailability = async (isAvailable: boolean) => {
        try {
            await availability.mutateAsync({ isAvailable })
            toast.success(isAvailable ? t.available : t.unavailable)
        } catch (error) {
            toast.error(toErrorMessage(error))
        }
    }

    return (
        <>
            <PageHeader title={t.title} description={t.overviewDesc} />
            <DataState
                isLoading={profileQuery.isLoading}
                isError={profileQuery.isError}
                onRetry={() => profileQuery.refetch()}
            >
                {profile && (
                    <div className="grid gap-4 @2xl:grid-cols-2">
                        {/* Availability */}
                        <Card className="rounded-lg @2xl:col-span-2">
                            <CardContent className="flex flex-col gap-4 p-5 @2xl:flex-row @2xl:items-center @2xl:justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="grid size-12 place-items-center rounded-full bg-primary/10">
                                        <RiHeartPulseLine className="size-6 text-primary" />
                                    </span>
                                    <div>
                                        <p className="font-heading text-lg font-semibold">
                                            {profile.isAvailable
                                                ? t.available
                                                : t.unavailable}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {t.availabilityDesc}
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    checked={profile.isAvailable}
                                    disabled={availability.isPending}
                                    onCheckedChange={toggleAvailability}
                                    aria-label={dictionary.app.fields.availability}
                                />
                            </CardContent>
                        </Card>

                        {/* Stats */}
                        <StatCard
                            icon={<RiDropLine className="size-6 text-primary" />}
                            label={t.totalDonations}
                            value={String(profile.totalDonations)}
                        />
                        <Card className="rounded-lg">
                            <CardContent className="flex items-center gap-4 p-5">
                                <span className="grid size-12 place-items-center rounded-full bg-primary/10">
                                    <BloodGroupBadge
                                        bloodGroup={profile.bloodGroup}
                                    />
                                </span>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">
                                        {dictionary.app.fields.verification}
                                    </p>
                                    <VerificationBadge
                                        verification={profile.verification}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Eligibility */}
                        <Card className="rounded-lg @2xl:col-span-2">
                            <CardContent className="flex items-center justify-between gap-4 p-5">
                                <div className="flex items-center gap-3">
                                    {eligibility?.isEligible ? (
                                        <RiCheckboxCircleLine className="size-6 text-emerald-500" />
                                    ) : (
                                        <RiCloseCircleLine className="size-6 text-amber-500" />
                                    )}
                                    <div>
                                        <p className="font-medium">
                                            {eligibility?.isEligible
                                                ? t.eligible
                                                : t.notEligible}
                                        </p>
                                        {profile.nextEligibleDate && (
                                            <p className="text-sm text-muted-foreground">
                                                {t.nextEligible}:{" "}
                                                {formatDate(
                                                    profile.nextEligibleDate
                                                )}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </DataState>
        </>
    )
}

function StatCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode
    label: string
    value: string
}) {
    return (
        <Card className="rounded-lg">
            <CardContent className="flex items-center gap-4 p-5">
                <span className="grid size-12 place-items-center rounded-full bg-primary/10">
                    {icon}
                </span>
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="font-heading text-2xl font-bold">{value}</p>
                </div>
            </CardContent>
        </Card>
    )
}
