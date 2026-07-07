import { useState } from "react"
import { toast } from "sonner"
import { RiDownload2Line } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { Field, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
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
import { RequestStatusBadge } from "@/components/status-badges"
import { useAdminReports } from "@/lib/api/hooks/use-admin"
import { adminExportReports } from "@/lib/api/generated/rakto-setu"
import { unwrap } from "@/lib/api/unwrap"
import { toErrorMessage } from "@/lib/api/error"
import { useI18n } from "@/lib/i18n/context"

export function AdminReportsPage() {
    const { dictionary } = useI18n()
    const t = dictionary.app.admin
    const [range, setRange] = useState<{ from?: string; to?: string }>({})
    const [exporting, setExporting] = useState(false)
    const query = useAdminReports(range)
    const report = query.data

    const handleExport = async () => {
        setExporting(true)
        try {
            // The CSV comes back inside the standard envelope's `data` field.
            const csv = unwrap(await adminExportReports(range)) as unknown
            const text =
                typeof csv === "string" ? csv : JSON.stringify(csv, null, 2)
            const blob = new Blob([text], { type: "text/csv;charset=utf-8" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = `raktosetu-report-${Date.now()}.csv`
            link.click()
            URL.revokeObjectURL(url)
        } catch (error) {
            toast.error(toErrorMessage(error))
        } finally {
            setExporting(false)
        }
    }

    return (
        <>
            <PageHeader
                title={t.reportsTitle}
                description={t.reportsDesc}
                actions={
                    <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        disabled={exporting}
                        onClick={handleExport}
                    >
                        <RiDownload2Line className="size-4" />
                        {dictionary.app.actions.export}
                    </Button>
                }
            />

            <div className="mb-6 flex flex-wrap gap-4">
                <Field className="w-auto">
                    <FieldLabel htmlFor="from">From</FieldLabel>
                    <Input
                        id="from"
                        type="date"
                        onChange={(event) =>
                            setRange((prev) => ({
                                ...prev,
                                from: event.target.value || undefined,
                            }))
                        }
                    />
                </Field>
                <Field className="w-auto">
                    <FieldLabel htmlFor="to">To</FieldLabel>
                    <Input
                        id="to"
                        type="date"
                        onChange={(event) =>
                            setRange((prev) => ({
                                ...prev,
                                to: event.target.value || undefined,
                            }))
                        }
                    />
                </Field>
            </div>

            <DataState
                isLoading={query.isLoading}
                isError={query.isError}
                onRetry={() => query.refetch()}
            >
                {report && (
                    <div className="grid gap-6 @2xl:grid-cols-[1.5fr_1fr]">
                        <Card className="overflow-hidden rounded-lg">
                            <CardHeader>
                                <h2 className="font-heading font-semibold">
                                    {t.requestsByStatus}
                                </h2>
                            </CardHeader>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            {dictionary.app.fields.status}
                                        </TableHead>
                                        <TableHead className="text-right">
                                            #
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {report.requestsByStatus.map((row) => (
                                        <TableRow key={row.status}>
                                            <TableCell>
                                                <RequestStatusBadge
                                                    status={row.status}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {row.count}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>

                        <Card className="rounded-lg">
                            <CardContent className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
                                <p className="font-heading text-5xl font-bold text-primary">
                                    {report.donations}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {t.totalDonations}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </DataState>
        </>
    )
}
