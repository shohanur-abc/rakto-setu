import { useState } from "react"
import { toast } from "sonner"
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs"
import { RiMore2Line } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Field, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
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
import { PaginationControl } from "@/components/pagination-control"
import { BloodGroupBadge } from "@/components/blood-group-badge"
import {
    RequestStatusBadge,
    UrgencyBadge,
} from "@/components/status-badges"
import {
    useAdminRequests,
    useAssignDonor,
    useCloseRequest,
    usePublishRequest,
    useRejectRequest,
} from "@/lib/api/hooks/use-admin"
import { toErrorMessage } from "@/lib/api/error"
import { useI18n } from "@/lib/i18n/context"
import { formatDate } from "@/lib/format"
import type {
    AdminListRequestsStatus,
    BloodRequestViewDto,
} from "@/lib/api/generated/rakto-setu"

const statusFilters = [
    "pending_review",
    "published",
    "matched",
    "in_progress",
    "fulfilled",
    "cancelled",
    "expired",
    "unfulfilled",
] as const

const closeStatuses = ["fulfilled", "cancelled", "expired", "unfulfilled"] as const

export function AdminRequestsPage() {
    const { dictionary } = useI18n()
    const t = dictionary.app.admin
    const [params, setParams] = useQueryStates({
        status: parseAsString.withDefault(""),
        page: parseAsInteger.withDefault(1),
    })

    const query = useAdminRequests({
        status: (params.status || undefined) as
            | AdminListRequestsStatus
            | undefined,
        page: params.page,
        limit: 15,
    })

    const requests = query.data?.items ?? []
    const meta = query.data?.meta

    return (
        <>
            <PageHeader title={t.requestsTitle} description={t.requestsDesc} />

            <div className="mb-4 max-w-xs">
                <Select
                    value={params.status || "all"}
                    onValueChange={(value) =>
                        setParams({
                            status: value === "all" ? "" : value,
                            page: 1,
                        })
                    }
                >
                    <SelectTrigger aria-label={dictionary.app.fields.status}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">
                            {dictionary.common.all}
                        </SelectItem>
                        {statusFilters.map((status) => (
                            <SelectItem key={status} value={status}>
                                {dictionary.app.status[status]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <DataState
                isLoading={query.isLoading}
                isError={query.isError}
                isEmpty={requests.length === 0}
                onRetry={() => query.refetch()}
                emptyTitle={dictionary.common.noResults}
            >
                <Card className="overflow-x-auto rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    {dictionary.app.fields.patientName}
                                </TableHead>
                                <TableHead>
                                    {dictionary.app.fields.bloodGroup}
                                </TableHead>
                                <TableHead>
                                    {dictionary.app.fields.urgency}
                                </TableHead>
                                <TableHead>
                                    {dictionary.app.fields.status}
                                </TableHead>
                                <TableHead>
                                    {dictionary.app.fields.neededBy}
                                </TableHead>
                                <TableHead className="text-right" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.map((request) => (
                                <RequestRow
                                    key={request.id}
                                    request={request}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </Card>
                {meta && (
                    <PaginationControl
                        page={meta.page}
                        totalPages={meta.totalPages}
                        onChange={(page) => setParams({ page })}
                    />
                )}
            </DataState>
        </>
    )
}

function RequestRow({ request }: { request: BloodRequestViewDto }) {
    const { dictionary } = useI18n()
    const t = dictionary.app.admin
    const publish = usePublishRequest()
    const reject = useRejectRequest()
    const assign = useAssignDonor()
    const close = useCloseRequest()

    const [assignOpen, setAssignOpen] = useState(false)
    const [closeOpen, setCloseOpen] = useState(false)
    const [donorId, setDonorId] = useState("")
    const [closeStatus, setCloseStatus] = useState<string>("fulfilled")

    const status = String(request.status).toLowerCase()
    const isPending = status === "pending_review"

    const run = async (fn: () => Promise<unknown>, message: string) => {
        try {
            await fn()
            toast.success(message)
        } catch (error) {
            toast.error(toErrorMessage(error))
        }
    }

    return (
        <TableRow>
            <TableCell className="font-medium">{request.patientName}</TableCell>
            <TableCell>
                <BloodGroupBadge bloodGroup={request.bloodGroup} size="sm" />
            </TableCell>
            <TableCell>
                <UrgencyBadge urgency={request.urgency} />
            </TableCell>
            <TableCell>
                <RequestStatusBadge status={request.status} />
            </TableCell>
            <TableCell className="text-muted-foreground">
                {formatDate(request.neededBy)}
            </TableCell>
            <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={dictionary.app.actions.view}
                        >
                            <RiMore2Line className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {isPending && (
                            <>
                                <DropdownMenuItem
                                    onClick={() =>
                                        run(
                                            () =>
                                                publish.mutateAsync(request.id),
                                            t.requestUpdated
                                        )
                                    }
                                >
                                    {t.publish}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() =>
                                        run(
                                            () => reject.mutateAsync(request.id),
                                            t.requestUpdated
                                        )
                                    }
                                >
                                    {t.rejectRequest}
                                </DropdownMenuItem>
                            </>
                        )}
                        <DropdownMenuItem onClick={() => setAssignOpen(true)}>
                            {t.assign}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCloseOpen(true)}>
                            {t.close}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Assign donor dialog */}
                <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t.assign}</DialogTitle>
                        </DialogHeader>
                        <Field>
                            <FieldLabel htmlFor="donorId">
                                {t.assignDesc}
                            </FieldLabel>
                            <Input
                                id="donorId"
                                value={donorId}
                                onChange={(event) =>
                                    setDonorId(event.target.value)
                                }
                                placeholder="donor user id"
                            />
                        </Field>
                        <DialogFooter>
                            <Button
                                disabled={!donorId || assign.isPending}
                                onClick={async () => {
                                    await run(
                                        () =>
                                            assign.mutateAsync({
                                                id: request.id,
                                                dto: { donorId },
                                            }),
                                        t.requestUpdated
                                    )
                                    setAssignOpen(false)
                                    setDonorId("")
                                }}
                            >
                                {t.assign}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Close request dialog */}
                <Dialog open={closeOpen} onOpenChange={setCloseOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t.close}</DialogTitle>
                        </DialogHeader>
                        <Field>
                            <FieldLabel>{dictionary.app.fields.status}</FieldLabel>
                            <Select
                                value={closeStatus}
                                onValueChange={setCloseStatus}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {closeStatuses.map((value) => (
                                        <SelectItem key={value} value={value}>
                                            {dictionary.app.status[value]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <DialogFooter>
                            <Button
                                disabled={close.isPending}
                                onClick={async () => {
                                    await run(
                                        () =>
                                            close.mutateAsync({
                                                id: request.id,
                                                dto: {
                                                    status: closeStatus as (typeof closeStatuses)[number],
                                                },
                                            }),
                                        t.requestUpdated
                                    )
                                    setCloseOpen(false)
                                }}
                            >
                                {t.close}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </TableCell>
        </TableRow>
    )
}
