import { toast } from "sonner"
import { RiCheckLine, RiCloseLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { PageHeader } from "@/components/page-header"
import { DataState } from "@/components/data-state"
import { BloodGroupBadge } from "@/components/blood-group-badge"
import {
    useAdminPendingDonors,
    useVerifyDonor,
} from "@/lib/api/hooks/use-admin"
import { toErrorMessage } from "@/lib/api/error"
import { useI18n } from "@/lib/i18n/context"
import { formatDate } from "@/lib/format"

export function AdminDonorsPage() {
    const { dictionary } = useI18n()
    const t = dictionary.app.admin
    const query = useAdminPendingDonors()
    const verify = useVerifyDonor()

    const donors = query.data ?? []

    const decide = async (
        id: string,
        verification: "verified" | "rejected"
    ) => {
        try {
            await verify.mutateAsync({ id, verification })
            toast.success(t.verifyDone)
        } catch (error) {
            toast.error(toErrorMessage(error))
        }
    }

    return (
        <>
            <PageHeader title={t.donorsTitle} description={t.donorsDesc} />
            <DataState
                isLoading={query.isLoading}
                isError={query.isError}
                isEmpty={donors.length === 0}
                onRetry={() => query.refetch()}
                emptyTitle={dictionary.app.notifications.empty}
            >
                <div className="grid gap-4 @2xl:grid-cols-2">
                    {donors.map((donor) => (
                        <Card key={donor.id} className="rounded-lg">
                            <CardContent className="flex flex-col gap-4 p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-heading text-lg font-semibold">
                                            {donor.fullName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {donor.phone}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {dictionary.app.fields.created}:{" "}
                                            {formatDate(donor.createdAt)}
                                        </p>
                                    </div>
                                    <BloodGroupBadge
                                        bloodGroup={donor.bloodGroup}
                                        size="lg"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        className="flex-1 gap-1.5"
                                        disabled={verify.isPending}
                                        onClick={() =>
                                            decide(donor.id, "verified")
                                        }
                                    >
                                        <RiCheckLine className="size-4" />
                                        {t.verify}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 gap-1.5 text-destructive"
                                        disabled={verify.isPending}
                                        onClick={() =>
                                            decide(donor.id, "rejected")
                                        }
                                    >
                                        <RiCloseLine className="size-4" />
                                        {t.reject}
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
