import { Card } from "@workspace/ui/components/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table"
import { PageHeader } from "@/components/page-header"
import { DataState } from "@/components/data-state"
import { useDonorDonations } from "@/lib/api/hooks/use-donor"
import { useI18n } from "@/lib/i18n/context"
import { formatDate } from "@/lib/format"
import type { DonationRecord } from "@/routes/donor/types"

export function DonorDonationsPage() {
    const { dictionary } = useI18n()
    const t = dictionary.app.donor
    const query = useDonorDonations()
    const donations = (query.data ?? []) as unknown as DonationRecord[]

    return (
        <>
            <PageHeader title={t.donationsTitle} description={t.donationsDesc} />
            <DataState
                isLoading={query.isLoading}
                isError={query.isError}
                isEmpty={donations.length === 0}
                onRetry={() => query.refetch()}
            >
                <Card className="overflow-hidden rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    {dictionary.app.fields.lastDonation}
                                </TableHead>
                                <TableHead>
                                    {dictionary.app.recipient.detailTitle}
                                </TableHead>
                                <TableHead className="text-right">
                                    {t.units}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {donations.map((donation) => (
                                <TableRow key={donation.id}>
                                    <TableCell>
                                        {formatDate(donation.donationDate)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {donation.patientName ?? "—"}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {donation.units}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </DataState>
        </>
    )
}
