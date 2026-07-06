import { useQueryStates } from "nuqs"
import { RiFileList3Line } from "@remixicon/react"
import { Card, CardContent } from "@workspace/ui/components/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import { Button } from "@workspace/ui/components/button"
import { Section } from "@workspace/ui/components/section"
import { DataState } from "@/components/data-state"
import { RequestCard } from "@/components/request-card"
import { PaginationControl } from "@/components/pagination-control"
import { usePublicRequests, useLocations } from "@/lib/api/public-data"
import { publicSearchClientParsers } from "@/lib/url/public-search-params"
import { bloodGroupValues, urgencyValues } from "@/lib/url/options"
import { useI18n } from "@/lib/i18n/context"
import type {
    RequestsListPublicBloodGroup,
    RequestsListPublicUrgency,
} from "@/lib/api/generated/rakto-setu"

export function PublicRequestsPage() {
    const { dictionary, localePath } = useI18n()
    const t = dictionary.requestsPage
    const common = dictionary.common
    const [params, setParams] = useQueryStates(publicSearchClientParsers)
    const { data: locations = [] } = useLocations()

    const query = usePublicRequests({
        bloodGroup: (params.bloodGroup ?? undefined) as
            | RequestsListPublicBloodGroup
            | undefined,
        locationId: params.locationId ?? undefined,
        urgency: (params.urgency ?? undefined) as
            | RequestsListPublicUrgency
            | undefined,
        page: params.page,
        limit: params.limit,
    })

    const requests = query.data?.items ?? []
    const meta = query.data?.meta

    return (
        <Section
            eyebrow={{
                icon: <RiFileList3Line />,
                text: dictionary.nav.activeRequests,
            }}
            title={t.title}
            description={t.description}
            align="left"
        >
            <Card className="mb-8 rounded-lg">
                <CardContent className="flex flex-col gap-3 p-4 @2xl:flex-row @2xl:items-end">
                    <FilterSelect
                        label={common.bloodGroup}
                        placeholder={common.bloodGroup}
                        value={params.bloodGroup ?? undefined}
                        options={bloodGroupValues.map((g) => ({
                            value: g,
                            label: g,
                        }))}
                        onChange={(value) =>
                            setParams({
                                bloodGroup:
                                    value as (typeof bloodGroupValues)[number],
                                page: 1,
                            })
                        }
                    />
                    <FilterSelect
                        label={common.location}
                        placeholder={common.allLocations}
                        value={params.locationId ?? undefined}
                        options={locations.map((l) => ({
                            value: l.id,
                            label: l.name,
                        }))}
                        onChange={(value) =>
                            setParams({ locationId: value, page: 1 })
                        }
                    />
                    <FilterSelect
                        label={common.urgency}
                        placeholder={common.allUrgencies}
                        value={params.urgency ?? undefined}
                        options={urgencyValues.map((u) => ({
                            value: u,
                            label: dictionary.app.urgencyLevels[u],
                        }))}
                        onChange={(value) =>
                            setParams({
                                urgency:
                                    value as (typeof urgencyValues)[number],
                                page: 1,
                            })
                        }
                    />
                    <Button
                        variant="outline"
                        onClick={() =>
                            setParams({
                                bloodGroup: null,
                                locationId: null,
                                urgency: null,
                                page: 1,
                            })
                        }
                    >
                        {common.clear}
                    </Button>
                </CardContent>
            </Card>

            <DataState
                isLoading={query.isLoading}
                isError={query.isError}
                isEmpty={requests.length === 0}
                onRetry={() => query.refetch()}
                emptyTitle={common.noResults}
                emptyDescription={t.publishedOnly}
            >
                <div className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
                    {requests.map((request) => (
                        <RequestCard
                            key={request.id}
                            request={request}
                            href={localePath(`/requests/public/${request.id}`)}
                        />
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
        </Section>
    )
}

function FilterSelect({
    label,
    placeholder,
    value,
    options,
    onChange,
}: {
    label: string
    placeholder: string
    value?: string
    options: { value: string; label: string }[]
    onChange: (value: string) => void
}) {
    return (
        <div className="flex-1 space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
                {label}
            </label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger aria-label={label}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
