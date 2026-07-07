import { useQueryStates } from "nuqs"
import { RiDropLine, RiSearchLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import { Section } from "@workspace/ui/components/section"
import { BloodGroupBadge } from "@/components/blood-group-badge"
import { DataState } from "@/components/data-state"
import { PaginationControl } from "@/components/pagination-control"
import { useDonorSearch, useLocations } from "@/lib/api/public-data"
import { publicSearchClientParsers } from "@/lib/url/public-search-params"
import { bloodGroupValues } from "@/lib/url/options"
import { useI18n } from "@/lib/i18n/context"
import { formatDate } from "@/lib/format"
import type { SearchSearchDonorsBloodGroup } from "@/lib/api/generated/rakto-setu"

export function SearchPage() {
    const { dictionary } = useI18n()
    const t = dictionary.searchPage
    const common = dictionary.common
    const [params, setParams] = useQueryStates(publicSearchClientParsers)
    const { data: locations = [] } = useLocations()

    const hasGroup = Boolean(params.bloodGroup)
    const query = useDonorSearch(
        {
            bloodGroup: params.bloodGroup as SearchSearchDonorsBloodGroup,
            locationId: params.locationId ?? undefined,
            page: params.page,
            limit: params.limit,
        },
        hasGroup
    )

    const donors = query.data?.items ?? []
    const meta = query.data?.meta

    return (
        <Section
            eyebrow={{ icon: <RiSearchLine />, text: dictionary.nav.findBlood }}
            title={t.title}
            description={t.description}
            align="left"
        >
            {/* Filter bar */}
            <Card className="mb-8 rounded-lg">
                <CardContent className="flex flex-col gap-3 p-4 @2xl:flex-row @2xl:items-end">
                    <div className="flex-1 space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            {common.bloodGroup}
                        </label>
                        <Select
                            value={params.bloodGroup ?? undefined}
                            onValueChange={(value) =>
                                setParams({
                                    bloodGroup:
                                        value as (typeof bloodGroupValues)[number],
                                    page: 1,
                                })
                            }
                        >
                            <SelectTrigger aria-label={common.bloodGroup}>
                                <SelectValue placeholder={common.bloodGroup} />
                            </SelectTrigger>
                            <SelectContent>
                                {bloodGroupValues.map((group) => (
                                    <SelectItem key={group} value={group}>
                                        {group}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1 space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            {common.location}
                        </label>
                        <Select
                            value={params.locationId ?? undefined}
                            onValueChange={(value) =>
                                setParams({ locationId: value, page: 1 })
                            }
                        >
                            <SelectTrigger aria-label={common.location}>
                                <SelectValue placeholder={common.allLocations} />
                            </SelectTrigger>
                            <SelectContent>
                                {locations.map((location) => (
                                    <SelectItem
                                        key={location.id}
                                        value={location.id}
                                    >
                                        {location.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() =>
                            setParams({
                                bloodGroup: null,
                                locationId: null,
                                page: 1,
                            })
                        }
                    >
                        {common.clear}
                    </Button>
                </CardContent>
            </Card>

            {!hasGroup ? (
                <p className="rounded-lg border border-dashed border-border bg-muted/30 px-6 py-12 text-center text-sm text-muted-foreground">
                    {t.emptyPrompt}
                </p>
            ) : (
                <DataState
                    isLoading={query.isLoading}
                    isError={query.isError}
                    isEmpty={donors.length === 0}
                    onRetry={() => query.refetch()}
                    emptyTitle={common.noResults}
                >
                    <p className="mb-4 text-sm text-muted-foreground">
                        {meta?.total ?? donors.length} {t.resultCount}
                    </p>
                    <div className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
                        {donors.map((donor) => (
                            <Card key={donor.id} className="rounded-lg">
                                <CardContent className="flex flex-col gap-4 p-5">
                                    <div className="flex items-center justify-between">
                                        <p className="font-heading text-lg font-semibold">
                                            {donor.fullName}
                                        </p>
                                        <BloodGroupBadge
                                            bloodGroup={donor.bloodGroup}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-1.5 text-muted-foreground">
                                            <RiDropLine className="size-4 text-primary" />
                                            {donor.totalDonations}{" "}
                                            {t.totalDonations}
                                        </span>
                                    </div>
                                    {donor.nextEligibleDate && (
                                        <p className="text-xs text-muted-foreground">
                                            {t.nextEligible}:{" "}
                                            {formatDate(donor.nextEligibleDate)}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    {meta && (
                        <PaginationControl
                            page={meta.page}
                            totalPages={meta.totalPages}
                            onChange={(page) => setParams({ page })}
                        />
                    )}
                </DataState>
            )}
        </Section>
    )
}
