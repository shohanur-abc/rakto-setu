"use client"

import { useMemo, useState } from "react"
import {
    RiDeleteBinLine,
    RiSearchLine,
    RiShieldCheckLine,
    RiUserLine,
} from "@remixicon/react"
import { useQueryClient } from "@tanstack/react-query"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Separator } from "@workspace/ui/components/separator"
import {
    getAdminListUsersQueryKey,
    useAdminDeleteUser,
    useAdminGetUser,
    useAdminListUsers,
    useAdminUpdateUserStatus,
} from "api-client/src/admin"
import type { UserResponse } from "api-client/src/raktoSetuAPI.schemas"
import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { EmptyState, ErrorState, LoadingRows, formatDate } from "@/components/api-surface"
import { BloodGroupBadge } from "@/components/blood-group-badge"
import { AdminTabs } from "../admin-tabs"

const PAGE_SIZE = 20

export function AdminUsersClient({ lang }: { lang: string }) {
    const queryClient = useQueryClient()
    const [searchInput, setSearchInput] = useState("")
    const [search, setSearch] = useState("")
    const [selectedUserId, setSelectedUserId] = useState("")
    const userParams = useMemo(
        () => ({ page: 1, limit: PAGE_SIZE, search: search || undefined }),
        [search],
    )

    const users = useAdminListUsers(userParams)
    const selectedUser = useAdminGetUser(selectedUserId || "pending", {
        query: { enabled: Boolean(selectedUserId) },
    })
    const invalidateUsers = () =>
        queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey(userParams) })
    const updateUser = useAdminUpdateUserStatus({ mutation: { onSuccess: invalidateUsers } })
    const deleteUser = useAdminDeleteUser({
        mutation: {
            onSuccess: () => {
                setSelectedUserId("")
                invalidateUsers()
            },
        },
    })

    const items = users.data?.items ?? []
    const selectedListUser = items.find((item) => item.id === selectedUserId)
    const activeCount = items.filter((item) => item.status === "active").length
    const suspendedCount = items.filter((item) => item.status === "suspended").length
    const pendingCount = items.filter((item) => item.status === "pending_verification").length

    return (
        <>
            <PageHeader
                eyebrow="Admin"
                title="Users"
                subtitle="Find people quickly, inspect account details, and handle account status without leaving the page."
            />
            <AdminTabs lang={lang} />
            <Container className="space-y-6 py-8 @2xl:py-10">
                <form
                    className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 @2xl:flex-row @2xl:items-center"
                    onSubmit={(event) => {
                        event.preventDefault()
                        setSearch(searchInput.trim())
                    }}
                >
                    <div className="relative flex-1">
                        <RiSearchLine className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            placeholder="Search by name, phone, or email"
                            className="pl-9"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={users.isFetching}>
                            Search
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setSearchInput("")
                                setSearch("")
                            }}
                        >
                            Reset
                        </Button>
                    </div>
                </form>

                <div className="grid gap-3 @2xl:grid-cols-3">
                    <Stat label="Active" value={activeCount} tone="success" />
                    <Stat label="Pending verification" value={pendingCount} tone="warning" />
                    <Stat label="Suspended" value={suspendedCount} tone="danger" />
                </div>

                {(updateUser.error || deleteUser.error || selectedUser.error) && (
                    <ErrorState error={updateUser.error ?? deleteUser.error ?? selectedUser.error} />
                )}

                <div className="grid gap-6 @6xl:grid-cols-[minmax(0,1fr)_360px]">
                    <section className="min-w-0">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">User directory</h2>
                                <p className="text-sm text-muted-foreground">
                                    Showing {items.length} of {users.data?.meta?.total ?? items.length} users
                                </p>
                            </div>
                            {users.isFetching && !users.isLoading && (
                                <Badge variant="secondary">Refreshing</Badge>
                            )}
                        </div>

                        {users.error ? (
                            <ErrorState error={users.error} />
                        ) : users.isLoading ? (
                            <LoadingRows rows={6} />
                        ) : items.length ? (
                            <div className="overflow-hidden rounded-lg border border-border bg-card">
                                {items.map((item, index) => (
                                    <UserRow
                                        key={item.id}
                                        user={item}
                                        selected={item.id === selectedUserId}
                                        onSelect={() => setSelectedUserId(item.id)}
                                        onToggleStatus={() =>
                                            updateUser.mutate({
                                                id: item.id,
                                                data: {
                                                    status:
                                                        item.status === "suspended"
                                                            ? "active"
                                                            : "suspended",
                                                },
                                            })
                                        }
                                        onDelete={() => deleteUser.mutate({ id: item.id })}
                                        busy={updateUser.isPending || deleteUser.isPending}
                                        showSeparator={index < items.length - 1}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyState>No users match the current search.</EmptyState>
                        )}
                    </section>

                    <aside className="h-fit rounded-lg border border-border bg-card p-4 @6xl:sticky @6xl:top-(--sticky-detail-offset)">
                        <div className="mb-4 flex items-center gap-2">
                            <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <RiUserLine className="size-5" aria-hidden="true" />
                            </span>
                            <div>
                                <h2 className="font-semibold text-foreground">User detail</h2>
                                <p className="text-xs text-muted-foreground">
                                    Select a user to inspect the full admin record.
                                </p>
                            </div>
                        </div>

                        {!selectedUserId ? (
                            <EmptyState>Select a user from the directory.</EmptyState>
                        ) : selectedUser.isLoading ? (
                            <LoadingRows rows={3} />
                        ) : selectedUser.data ? (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">
                                        {selectedUser.data.fullName}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedUser.data.phone}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <RoleBadge role={selectedUser.data.role} />
                                    <StatusBadge status={selectedUser.data.status} />
                                    {selectedUser.data.bloodGroup && (
                                        <BloodGroupBadge group={selectedUser.data.bloodGroup} />
                                    )}
                                </div>
                                <Separator />
                                <dl className="space-y-3 text-sm">
                                    <Detail label="Email" value={selectedUser.data.email ?? "Not provided"} />
                                    <Detail label="Phone verified" value={selectedUser.data.phoneVerified ? "Yes" : "No"} />
                                    <Detail label="Language" value={selectedUser.data.preferredLanguage} />
                                    <Detail label="Location id" value={selectedUser.data.locationId ?? "Not set"} />
                                    <Detail label="Created" value={formatDate(selectedUser.data.createdAt, lang)} />
                                </dl>
                                <Separator />
                                <div className="flex flex-col gap-2">
                                    <Button
                                        onClick={() =>
                                            updateUser.mutate({
                                                id: selectedUser.data.id,
                                                data: {
                                                    status:
                                                        selectedUser.data.status === "suspended"
                                                            ? "active"
                                                            : "suspended",
                                                },
                                            })
                                        }
                                        disabled={updateUser.isPending}
                                    >
                                        <RiShieldCheckLine className="size-4" aria-hidden="true" />
                                        {selectedUser.data.status === "suspended"
                                            ? "Reactivate user"
                                            : "Suspend user"}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => deleteUser.mutate({ id: selectedUser.data.id })}
                                        disabled={deleteUser.isPending}
                                    >
                                        <RiDeleteBinLine className="size-4" aria-hidden="true" />
                                        Delete user
                                    </Button>
                                </div>
                            </div>
                        ) : selectedListUser ? (
                            <div className="space-y-3">
                                <p className="font-medium text-foreground">{selectedListUser.fullName}</p>
                                <p className="text-sm text-muted-foreground">
                                    Detail request has not returned yet.
                                </p>
                            </div>
                        ) : null}
                    </aside>
                </div>
            </Container>
        </>
    )
}

function UserRow({
    user,
    selected,
    onSelect,
    onToggleStatus,
    onDelete,
    busy,
    showSeparator,
}: {
    user: UserResponse
    selected: boolean
    onSelect: () => void
    onToggleStatus: () => void
    onDelete: () => void
    busy: boolean
    showSeparator: boolean
}) {
    return (
        <div className="group">
            <div
                className={[
                    "flex flex-col gap-3 p-3 transition-colors @3xl:flex-row @3xl:items-center @3xl:justify-between",
                    selected ? "bg-primary/5" : "hover:bg-secondary/60",
                ].join(" ")}
            >
                <button
                    type="button"
                    onClick={onSelect}
                    className="min-w-0 flex-1 text-left"
                >
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-medium text-foreground">{user.fullName}</span>
                        <RoleBadge role={user.role} />
                        <StatusBadge status={user.status} />
                        {user.bloodGroup && <BloodGroupBadge group={user.bloodGroup} />}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>{user.phone}</span>
                        <span>{user.email ?? "No email"}</span>
                        <span>{user.phoneVerified ? "Verified phone" : "Phone unverified"}</span>
                    </div>
                </button>
                <div className="flex shrink-0 flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={onSelect}>
                        Details
                    </Button>
                    <Button size="sm" onClick={onToggleStatus} disabled={busy}>
                        {user.status === "suspended" ? "Reactivate" : "Suspend"}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={onDelete} disabled={busy}>
                        Delete
                    </Button>
                </div>
            </div>
            {showSeparator && <Separator />}
        </div>
    )
}

function Stat({
    label,
    value,
    tone,
}: {
    label: string
    value: number
    tone: "success" | "warning" | "danger"
}) {
    const toneClass = {
        success: "text-emerald-600 dark:text-emerald-400",
        warning: "text-amber-600 dark:text-amber-400",
        danger: "text-destructive",
    }[tone]

    return (
        <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`mt-1 text-2xl font-semibold tabular-nums ${toneClass}`}>{value}</p>
        </div>
    )
}

function RoleBadge({ role }: { role: string }) {
    return <Badge variant={role === "admin" ? "default" : "secondary"}>{role}</Badge>
}

function StatusBadge({ status }: { status: string }) {
    const variant = status === "suspended" || status === "deleted" ? "destructive" : "outline"
    return <Badge variant={variant}>{status.replaceAll("_", " ")}</Badge>
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 font-medium text-foreground">{value}</dd>
        </div>
    )
}
