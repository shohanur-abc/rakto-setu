"use client"

import { useMemo, useState } from "react"
import {
    RiSearchLine,
    RiShieldCheckLine,
    RiUserHeartLine,
} from "@remixicon/react"
import { useQueryClient } from "@tanstack/react-query"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Separator } from "@workspace/ui/components/separator"
import {
    getAdminDashboardQueryKey,
    getAdminPendingDonorsQueryKey,
    useAdminPendingDonors,
    useAdminVerifyDonor,
} from "api-client/src/admin"
import type { PendingDonorResponse } from "api-client/src/raktoSetuAPI.schemas"
import { BloodGroupBadge } from "@/components/blood-group-badge"
import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { EmptyState, ErrorState, LoadingRows, formatDate } from "@/components/api-surface"
import { AdminTabs } from "../admin-tabs"

export function AdminDonorsClient({ lang }: { lang: string }) {
    const queryClient = useQueryClient()
    const [searchInput, setSearchInput] = useState("")
    const [search, setSearch] = useState("")
    const [selectedDonorId, setSelectedDonorId] = useState("")
    const donors = useAdminPendingDonors()
    const verify = useAdminVerifyDonor({
        mutation: {
            onSuccess: () => {
                setSelectedDonorId("")
                queryClient.invalidateQueries({ queryKey: getAdminPendingDonorsQueryKey() })
                queryClient.invalidateQueries({ queryKey: getAdminDashboardQueryKey() })
            },
        },
    })

    const items = useMemo(() => donors.data ?? [], [donors.data])
    const filtered = useMemo(() => {
        const needle = search.toLowerCase()
        if (!needle) return items
        return items.filter((donor) =>
            [
                donor.fullName,
                donor.phone,
                donor.bloodGroup,
                donor.verification,
                donor.userId,
                donor.id,
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(needle)),
        )
    }, [items, search])
    const selectedDonor =
        filtered.find((donor) => donor.id === selectedDonorId) ??
        items.find((donor) => donor.id === selectedDonorId)

    return (
        <>
            <PageHeader eyebrow="Admin" title="Pending donors" subtitle="Review donor verification requests with search and detail inspection." />
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
                            placeholder="Search by name, phone, blood group, or id"
                            className="pl-9"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={donors.isFetching}>Search</Button>
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
                    <Stat label="Pending review" value={items.length} />
                    <Stat label="Search matches" value={filtered.length} />
                    <Stat label="Previous donations" value={filtered.reduce((sum, donor) => sum + (donor.totalDonations ?? 0), 0)} />
                </div>

                {verify.error && <ErrorState error={verify.error} />}

                <div className="grid gap-6 @6xl:grid-cols-[minmax(0,1fr)_360px]">
                    <section className="min-w-0">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">Verification queue</h2>
                                <p className="text-sm text-muted-foreground">Showing {filtered.length} of {items.length} pending donors.</p>
                            </div>
                            {donors.isFetching && !donors.isLoading && <Badge variant="secondary">Refreshing</Badge>}
                        </div>
                        {donors.error ? <ErrorState error={donors.error} /> : donors.isLoading ? <LoadingRows rows={5} /> : filtered.length ? (
                            <div className="overflow-hidden rounded-lg border border-border bg-card">
                                {filtered.map((donor, index) => (
                                    <DonorRow
                                        key={donor.id}
                                        donor={donor}
                                        selected={donor.id === selectedDonorId}
                                        onSelect={() => setSelectedDonorId(donor.id)}
                                        onVerify={() => verify.mutate({ id: donor.id, data: { verification: "verified" } })}
                                        onReject={() => verify.mutate({ id: donor.id, data: { verification: "rejected" } })}
                                        busy={verify.isPending}
                                        showSeparator={index < filtered.length - 1}
                                        lang={lang}
                                    />
                                ))}
                            </div>
                        ) : <EmptyState>No pending donors match the current search.</EmptyState>}
                    </section>

                    <aside className="h-fit rounded-lg border border-border bg-card p-4 @6xl:sticky @6xl:top-(--sticky-detail-offset)">
                        <div className="mb-4 flex items-center gap-2">
                            <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <RiUserHeartLine className="size-5" aria-hidden="true" />
                            </span>
                            <div>
                                <h2 className="font-semibold text-foreground">Donor detail</h2>
                                <p className="text-xs text-muted-foreground">Inspect the selected pending donor before deciding.</p>
                            </div>
                        </div>

                        {selectedDonor ? (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">{selectedDonor.fullName}</h3>
                                    <p className="text-sm text-muted-foreground">{selectedDonor.phone ?? "No phone provided"}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <BloodGroupBadge group={selectedDonor.bloodGroup} />
                                    <Badge variant="outline">{selectedDonor.verification}</Badge>
                                </div>
                                <Separator />
                                <dl className="space-y-3 text-sm">
                                    <Detail label="Donor profile id" value={selectedDonor.id} />
                                    <Detail label="User id" value={selectedDonor.userId} />
                                    <Detail label="Total donations" value={selectedDonor.totalDonations ?? 0} />
                                    <Detail label="Submitted" value={selectedDonor.createdAt ? formatDate(selectedDonor.createdAt, lang) : "—"} />
                                </dl>
                                <Separator />
                                <div className="flex flex-col gap-2">
                                    <Button onClick={() => verify.mutate({ id: selectedDonor.id, data: { verification: "verified" } })} disabled={verify.isPending}>
                                        <RiShieldCheckLine className="size-4" aria-hidden="true" />
                                        Verify donor
                                    </Button>
                                    <Button variant="outline" onClick={() => verify.mutate({ id: selectedDonor.id, data: { verification: "rejected" } })} disabled={verify.isPending}>
                                        Reject donor
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <EmptyState>Select a donor from the queue.</EmptyState>
                        )}
                    </aside>
                </div>
            </Container>
        </>
    )
}

function DonorRow({
    donor,
    selected,
    onSelect,
    onVerify,
    onReject,
    busy,
    showSeparator,
    lang,
}: {
    donor: PendingDonorResponse
    selected: boolean
    onSelect: () => void
    onVerify: () => void
    onReject: () => void
    busy: boolean
    showSeparator: boolean
    lang: string
}) {
    return (
        <div>
            <div className={[
                "flex flex-col gap-3 p-4 transition-colors @3xl:flex-row @3xl:items-center @3xl:justify-between",
                selected ? "bg-primary/5" : "hover:bg-secondary/60",
            ].join(" ")}>
                <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <RiUserHeartLine className="size-4" aria-hidden="true" />
                        </span>
                        <h3 className="font-semibold text-foreground">{donor.fullName}</h3>
                        <BloodGroupBadge group={donor.bloodGroup} />
                        <Badge variant="outline">{donor.verification}</Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>{donor.phone ?? "No phone"}</span>
                        <span>{donor.totalDonations ?? 0} donations</span>
                        <span>Submitted {donor.createdAt ? formatDate(donor.createdAt, lang) : "—"}</span>
                    </div>
                </button>
                <div className="flex shrink-0 flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={onSelect}>Details</Button>
                    <Button size="sm" onClick={onVerify} disabled={busy}>Verify</Button>
                    <Button size="sm" variant="outline" onClick={onReject} disabled={busy}>Reject</Button>
                </div>
            </div>
            {showSeparator && <Separator />}
        </div>
    )
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
        </div>
    )
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 break-words font-medium text-foreground">{value}</dd>
        </div>
    )
}
