import { toast } from "sonner"
import {
    RiCheckLine,
    RiCloseLine,
    RiHospitalLine,
    RiMapPin2Line,
    RiTimeLine,
} from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { PageHeader } from "@/components/page-header"
import { DataState } from "@/components/data-state"
import { BloodGroupBadge } from "@/components/blood-group-badge"
import { UrgencyBadge } from "@/components/status-badges"
import { ConfirmDialog } from "@/components/confirm-dialog"
import {
    useAcceptRequest,
    useDeclineRequest,
    useDonorMatchingRequests,
} from "@/lib/api/hooks/use-donor"
import { toErrorMessage } from "@/lib/api/error"
import { useI18n } from "@/lib/i18n/context"
import { formatDate } from "@/lib/format"
import type { MatchingRequest } from "@/routes/donor/types"

export function DonorRequestsPage() {
    const { dictionary } = useI18n()
    const t = dictionary.app.donor
    const query = useDonorMatchingRequests()
    const accept = useAcceptRequest()
    const decline = useDeclineRequest()

    const requests = (query.data ?? []) as unknown as MatchingRequest[]

    const onAccept = async (id: string) => {
        try {
            await accept.mutateAsync(id)
            toast.success(t.accepted)
        } catch (error) {
            toast.error(toErrorMessage(error))
        }
    }

    const onDecline = async (id: string) => {
        try {
            await decline.mutateAsync(id)
            toast.success(t.declined)
        } catch (error) {
            toast.error(toErrorMessage(error))
        }
    }

    return (
        <>
            <PageHeader title={t.matchingTitle} description={t.matchingDesc} />
            <DataState
                isLoading={query.isLoading}
                isError={query.isError}
                isEmpty={requests.length === 0}
                onRetry={() => query.refetch()}
            >
                <div className="grid gap-4 @2xl:grid-cols-2">
                    {requests.map((request) => (
                        <Card key={request.id} className="rounded-lg">
                            <CardContent className="flex flex-col gap-4 p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <p className="font-heading text-lg font-semibold">
                                            {request.patientName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {request.unitsNeeded}{" "}
                                            {dictionary.requestsPage.units}
                                        </p>
                                    </div>
                                    <BloodGroupBadge
                                        bloodGroup={request.bloodGroup}
                                        size="lg"
                                    />
                                </div>
                                <UrgencyBadge urgency={request.urgency} />
                                <dl className="space-y-1.5 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <RiHospitalLine className="size-4" />
                                        {request.hospitalName}
                                    </div>
                                    {request.location?.name && (
                                        <div className="flex items-center gap-2">
                                            <RiMapPin2Line className="size-4" />
                                            {request.location.name}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <RiTimeLine className="size-4" />
                                        {dictionary.requestsPage.neededBy}{" "}
                                        {formatDate(request.neededBy)}
                                    </div>
                                </dl>
                                <div className="flex gap-2">
                                    <ConfirmDialog
                                        destructive={false}
                                        title={t.accept}
                                        description={t.matchingDesc}
                                        confirmLabel={t.accept}
                                        onConfirm={() => onAccept(request.id)}
                                        trigger={
                                            <Button
                                                size="sm"
                                                className="flex-1 gap-1.5"
                                            >
                                                <RiCheckLine className="size-4" />
                                                {t.accept}
                                            </Button>
                                        }
                                    />
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 gap-1.5"
                                        disabled={decline.isPending}
                                        onClick={() => onDecline(request.id)}
                                    >
                                        <RiCloseLine className="size-4" />
                                        {t.decline}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </DataState>
        </>
    )
}
