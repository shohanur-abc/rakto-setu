"use client"

import { useQueryStates } from "nuqs"
import { RiCloseLine, RiSearchLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import { publicSearchClientParsers } from "@/lib/url/public-search-client"
import { bloodGroupValues, urgencyValues } from "@/lib/url/options"
import type { LocationViewDto } from "@/lib/api/generated/rakto-setu"

const emptyValue = "__all"
type BloodGroupValue = (typeof bloodGroupValues)[number]
type UrgencyValue = (typeof urgencyValues)[number]

interface SearchFiltersProps {
    labels: {
        bloodGroup: string
        location: string
        urgency: string
        allLocations: string
        allUrgencies: string
        search: string
        clear: string
    }
    locations: LocationViewDto[]
    showUrgency: boolean
}

export function SearchFilters({
    labels,
    locations,
    showUrgency,
}: SearchFiltersProps) {
    const [params, setParams] = useQueryStates(publicSearchClientParsers, {
        shallow: false,
        history: "push",
    })

    const setWithFirstPage = (
        next: Partial<typeof params>,
        clearPage = true
    ) => {
        void setParams({ ...next, page: clearPage ? 1 : params.page })
    }

    return (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 @5xl:flex-row @5xl:items-center">
            <Select
                value={params.bloodGroup ?? emptyValue}
                onValueChange={(value) =>
                    setWithFirstPage({
                        bloodGroup:
                            value === emptyValue
                                ? null
                                : (value as BloodGroupValue),
                    })
                }
            >
                <SelectTrigger id="filter-blood-group" className="@5xl:w-40">
                    <SelectValue placeholder={labels.bloodGroup} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={emptyValue}>
                        {labels.bloodGroup}
                    </SelectItem>
                    {bloodGroupValues.map((group) => (
                        <SelectItem key={group} value={group}>
                            {group}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={params.locationId ?? emptyValue}
                onValueChange={(value) =>
                    setWithFirstPage({
                        locationId:
                            value === emptyValue ? null : value,
                    })
                }
            >
                <SelectTrigger id="filter-location" className="@5xl:w-56">
                    <SelectValue placeholder={labels.location} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={emptyValue}>
                        {labels.allLocations}
                    </SelectItem>
                    {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                            {location.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {showUrgency && (
                <Select
                    value={params.urgency ?? emptyValue}
                    onValueChange={(value) =>
                        setWithFirstPage({
                            urgency:
                                value === emptyValue
                                    ? null
                                    : (value as UrgencyValue),
                        })
                    }
                >
                    <SelectTrigger id="filter-urgency" className="@5xl:w-44">
                        <SelectValue placeholder={labels.urgency} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={emptyValue}>
                            {labels.allUrgencies}
                        </SelectItem>
                        {urgencyValues.map((urgency) => (
                            <SelectItem key={urgency} value={urgency}>
                                {urgency}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            <div className="flex gap-2 @5xl:ml-auto">
                <Button
                    id="filter-search"
                    className="gap-2"
                    onClick={() => setWithFirstPage({}, false)}
                >
                    <RiSearchLine className="size-4" />
                    {labels.search}
                </Button>
                <Button
                    id="filter-clear"
                    variant="outline"
                    size="icon"
                    aria-label={labels.clear}
                    onClick={() =>
                        void setParams({
                            bloodGroup: null,
                            locationId: null,
                            urgency: null,
                            page: 1,
                        })
                    }
                >
                    <RiCloseLine className="size-4" />
                </Button>
            </div>
        </div>
    )
}
