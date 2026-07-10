"use client"

import { RiRefreshLine, RiUser3Line, RiErrorWarningLine, RiInboxLine, RiMapPin2Line } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Badge } from "@workspace/ui/components/badge"
import { useState } from "react"

import type { Locale, T } from "@workspace/i18n"
import { useSearchSearchDonors } from "api-client/src/search"
import { useLocationsList } from "api-client/src/locations"
import { BloodGroupBadge, BLOOD_GROUPS } from "@/components/blood-group-badge"
import { PageHeader } from "@/components/page-header"
import { Container } from "@/components/container"

interface DonorsClientProps {
    lang: Locale
    t: T["donors"]
    common: T["common"]
}

export function DonorsClient({ lang, t }: DonorsClientProps) {
    const [bloodGroup, setBloodGroup] = useState<string>("")
    const [locationId, setLocationId] = useState<string>("")

    const locationsQ = useLocationsList()
    const locations = locationsQ.data ?? []

    const donorsQ = useSearchSearchDonors(
        {
            bloodGroup: (bloodGroup || undefined) as never,
            locationId: locationId || undefined,
        }
    )
    const donors = donorsQ.data?.items ?? []
    const error = donorsQ.error

    return (
        <>
            <PageHeader eyebrow={t.filters.bloodGroup} title={t.title} subtitle={t.subtitle} />
            <Container className="py-10 @2xl:py-12">
                <div className="mb-8 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 @2xl:flex-row @2xl:items-end">
                    <div className="flex-1">
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                            {t.filters.bloodGroup}
                        </label>
                        <Select value={bloodGroup} onValueChange={setBloodGroup}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t.filters.allGroups} />
                            </SelectTrigger>
                            <SelectContent>
                                {BLOOD_GROUPS.map((g) => (
                                    <SelectItem key={g} value={g}>
                                        {g}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1">
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                            {t.filters.location}
                        </label>
                        <Select value={locationId} onValueChange={setLocationId}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t.filters.allLocations} />
                            </SelectTrigger>
                            <SelectContent>
                                {locations.map((l) => (
                                    <SelectItem key={l.id} value={l.id}>
                                        {l.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setBloodGroup("")
                            setLocationId("")
                        }}
                    >
                        <RiRefreshLine className="size-4" aria-hidden="true" />
                        {t.filters.reset}
                    </Button>
                </div>

                {error ? (
                    <div className="flex items-center gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">
                        <RiErrorWarningLine className="size-5 shrink-0" />
                        <span>{error.messages?.[0] ?? t.states.error}</span>
                    </div>
                ) : donorsQ.isLoading ? (
                    <div className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-36 rounded-xl" />
                        ))}
                    </div>
                ) : donors.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-background/60 py-16 text-center">
                        <RiInboxLine className="size-10 text-muted-foreground" aria-hidden="true" />
                        <p className="text-base font-medium text-foreground">{t.empty.title}</p>
                        <p className="max-w-sm text-sm text-muted-foreground">{t.empty.desc}</p>
                    </div>
                ) : (
                    <>
                        <p className="mb-4 text-sm text-muted-foreground">
                            {t.result.count.replace("{count}", String(donors.length))}
                        </p>
                        <div className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
                            {donors.map((d) => (
                                <div key={d.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
                                    <div className="flex items-center justify-between">
                                        <BloodGroupBadge group={d.bloodGroup} size="lg" />
                                        <Badge variant="secondary">{t.result.available}</Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                                            <RiUser3Line className="size-5" aria-hidden="true" />
                                        </span>
                                        <div>
                                            <p className="font-semibold text-foreground">{d.fullName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {t.result.lastDonation}: {d.totalDonations}
                                            </p>
                                        </div>
                                    </div>
                                    {d.locationId && (
                                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <RiMapPin2Line className="size-3.5" aria-hidden="true" />
                                            {d.locationId}
                                        </p>
                                    )}
                                    <p className="mt-auto border-t border-border pt-3 text-xs text-muted-foreground">
                                        {t.result.noContact}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </Container>
        </>
    )
}
