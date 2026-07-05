"use client"

import { useRouter } from "next/navigation"
import { useQueryStates } from "nuqs"
import { RiSearchLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import { publicSearchClientParsers } from "@/lib/url/public-search-client"
import { bloodGroupValues } from "@/lib/url/options"
import type { Locale } from "@/lib/i18n/config"
import type { LocationViewDto } from "@/lib/api/generated/rakto-setu"

interface HeroSearchFormProps {
    lang: Locale
    labels: {
        bloodGroup: string
        location: string
    }
    submitLabel: string
    locations: LocationViewDto[]
}

type BloodGroupValue = (typeof bloodGroupValues)[number]

export function HeroSearchForm({
    lang,
    labels,
    submitLabel,
    locations,
}: HeroSearchFormProps) {
    const router = useRouter()
    const [params, setParams] = useQueryStates(publicSearchClientParsers)

    const handleSearch = () => {
        const query = new URLSearchParams()

        if (params.bloodGroup) query.set("bloodGroup", params.bloodGroup)
        if (params.locationId) query.set("locationId", params.locationId)

        router.push(`/${lang}/search${query.toString() ? `?${query}` : ""}`)
    }

    return (
        <div className="mt-8 flex flex-col gap-3 @2xl:flex-row @2xl:items-center">
            <Select
                value={params.bloodGroup ?? undefined}
                onValueChange={(value) =>
                    setParams({ bloodGroup: value as BloodGroupValue })
                }
            >
                <SelectTrigger
                    id="hero-blood-group"
                    className="@2xl:w-40"
                    aria-label={labels.bloodGroup}
                >
                    <SelectValue placeholder={labels.bloodGroup} />
                </SelectTrigger>
                <SelectContent>
                    {bloodGroupValues.map((group) => (
                        <SelectItem key={group} value={group}>
                            {group}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={params.locationId ?? undefined}
                onValueChange={(value) => setParams({ locationId: value })}
            >
                <SelectTrigger
                    id="hero-location"
                    className="@2xl:w-56"
                    aria-label={labels.location}
                >
                    <SelectValue placeholder={labels.location} />
                </SelectTrigger>
                <SelectContent>
                    {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                            {location.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Button
                id="hero-search-btn"
                size="lg"
                onClick={handleSearch}
                className="gap-2"
            >
                <RiSearchLine className="size-4" />
                {submitLabel}
            </Button>
        </div>
    )
}
