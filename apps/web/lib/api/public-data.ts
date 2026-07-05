import "server-only"

import { cacheLife, cacheTag } from "next/cache"
import {
    announcementsListPublic,
    infoCompatibility,
    infoEligibility,
    infoFaqs,
    locationsList,
    requestsGetPublic,
    requestsListPublic,
    searchAvailabilitySummary,
    searchSearchDonors,
    type RequestsListPublicParams,
    type SearchSearchDonorsParams,
} from "@/lib/api/generated/rakto-setu"
import { unwrap } from "@/lib/api/unwrap"

export async function getLocations() {
    "use cache"
    cacheLife("max")
    cacheTag("locations")

    return unwrap(await locationsList())
}

export async function getAnnouncements() {
    "use cache"
    cacheLife("minutes")
    cacheTag("announcements")

    return unwrap(await announcementsListPublic())
}

export async function getAvailabilitySummary(locationId?: string | null) {
    "use cache"
    cacheLife("minutes")
    cacheTag("availability-summary")

    return unwrap(
        await searchAvailabilitySummary(
            locationId ? { locationId } : undefined
        )
    )
}

export async function searchDonors(params: SearchSearchDonorsParams) {
    return unwrap(await searchSearchDonors(params))
}

export async function getPublicRequests(params?: RequestsListPublicParams) {
    return unwrap(await requestsListPublic(params))
}

export async function getPublicRequest(id: string) {
    return unwrap(await requestsGetPublic(id))
}

export async function getFaqs() {
    "use cache"
    cacheLife("days")
    cacheTag("info")

    return unwrap(await infoFaqs())
}

export async function getCompatibility() {
    "use cache"
    cacheLife("days")
    cacheTag("info")

    return unwrap(await infoCompatibility())
}

export async function getEligibility() {
    "use cache"
    cacheLife("days")
    cacheTag("info")

    return unwrap(await infoEligibility())
}
