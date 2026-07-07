import { Link } from "react-router-dom"
import { toast } from "sonner"
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs"
import { RiSearchLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
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
import { PaginationControl } from "@/components/pagination-control"
import { UserStatusBadge } from "@/components/status-badges"
import { ConfirmDialog } from "@/components/confirm-dialog"
import {
    useAdminUsers,
    useDeleteUser,
    useUpdateUserStatus,
} from "@/lib/api/hooks/use-admin"
import { toErrorMessage } from "@/lib/api/error"
import { useI18n } from "@/lib/i18n/context"

export function AdminUsersPage() {
    const { dictionary, localePath } = useI18n()
    const t = dictionary.app.admin
    const [params, setParams] = useQueryStates({
        search: parseAsString.withDefault(""),
        page: parseAsInteger.withDefault(1),
    })

    const query = useAdminUsers({
        search: params.search || undefined,
        page: params.page,
        limit: 15,
    })
    const updateStatus = useUpdateUserStatus()
    const deleteUser = useDeleteUser()

    const users = query.data?.items ?? []
    const meta = query.data?.meta

    return (
        <>
            <PageHeader title={t.usersTitle} description={t.usersDesc} />

            <div className="relative mb-4 max-w-sm">
                <RiSearchLine className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    className="pl-9"
                    placeholder={t.searchUsers}
                    defaultValue={params.search}
                    onChange={(event) => {
                        const value = event.target.value
                        setParams({ search: value, page: 1 })
                    }}
                />
            </div>

            <DataState
                isLoading={query.isLoading}
                isError={query.isError}
                isEmpty={users.length === 0}
                onRetry={() => query.refetch()}
                emptyTitle={dictionary.common.noResults}
            >
                <Card className="overflow-x-auto rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    {dictionary.app.fields.fullName}
                                </TableHead>
                                <TableHead>
                                    {dictionary.app.fields.phone}
                                </TableHead>
                                <TableHead>
                                    {dictionary.app.fields.role}
                                </TableHead>
                                <TableHead>
                                    {dictionary.app.fields.status}
                                </TableHead>
                                <TableHead className="text-right">
                                    {dictionary.app.actions.view}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => {
                                const status = String(user.status).toLowerCase()
                                const suspended = status === "suspended"
                                return (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            {user.fullName}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {user.phone}
                                        </TableCell>
                                        <TableCell className="capitalize">
                                            {String(user.role).toLowerCase()}
                                        </TableCell>
                                        <TableCell>
                                            <UserStatusBadge
                                                status={user.status}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        to={localePath(
                                                            `/admin/users/${user.id}`
                                                        )}
                                                    >
                                                        {
                                                            dictionary.app
                                                                .actions.view
                                                        }
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={
                                                        updateStatus.isPending
                                                    }
                                                    onClick={async () => {
                                                        try {
                                                            await updateStatus.mutateAsync(
                                                                {
                                                                    id: user.id,
                                                                    dto: {
                                                                        status: suspended
                                                                            ? "active"
                                                                            : "suspended",
                                                                    },
                                                                }
                                                            )
                                                            toast.success(
                                                                t.statusUpdated
                                                            )
                                                        } catch (error) {
                                                            toast.error(
                                                                toErrorMessage(
                                                                    error
                                                                )
                                                            )
                                                        }
                                                    }}
                                                >
                                                    {suspended
                                                        ? t.activate
                                                        : t.suspend}
                                                </Button>
                                                <ConfirmDialog
                                                    title={t.deleteUserConfirm}
                                                    confirmLabel={t.deleteUser}
                                                    onConfirm={async () => {
                                                        try {
                                                            await deleteUser.mutateAsync(
                                                                user.id
                                                            )
                                                            toast.success(
                                                                t.userDeleted
                                                            )
                                                        } catch (error) {
                                                            toast.error(
                                                                toErrorMessage(
                                                                    error
                                                                )
                                                            )
                                                        }
                                                    }}
                                                    trigger={
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive"
                                                        >
                                                            {
                                                                dictionary.app
                                                                    .actions
                                                                    .delete
                                                            }
                                                        </Button>
                                                    }
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
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
