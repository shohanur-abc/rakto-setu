import { useQuery } from "@tanstack/react-query"
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

// Public (unauthenticated) reads. These mirror the old server-side
// `public-data.ts`, but as client React Query hooks with sensible cache times.

export function useLocations() {
    return useQuery({
        queryKey: ["locations"],
        staleTime: Infinity,
        queryFn: async () => unwrap(await locationsList()),
    })
}

export function useAnnouncements() {
    return useQuery({
        queryKey: ["announcements"],
        staleTime: 60_000,
        queryFn: async () => unwrap(await announcementsListPublic()),
    })
}

export function useAvailabilitySummary(locationId?: string | null) {
    return useQuery({
        queryKey: ["availability-summary", locationId ?? null],
        staleTime: 60_000,
        queryFn: async () =>
            unwrap(
                await searchAvailabilitySummary(
                    locationId ? { locationId } : undefined
                )
            ),
    })
}

export function useDonorSearch(
    params: SearchSearchDonorsParams,
    enabled = true
) {
    return useQuery({
        queryKey: ["donor-search", params],
        enabled,
        queryFn: async () => unwrap(await searchSearchDonors(params)),
    })
}

export function usePublicRequests(params?: RequestsListPublicParams) {
    return useQuery({
        queryKey: ["public-requests", params ?? null],
        queryFn: async () => unwrap(await requestsListPublic(params)),
    })
}

export function usePublicRequest(id: string) {
    return useQuery({
        queryKey: ["public-request", id],
        queryFn: async () => unwrap(await requestsGetPublic(id)),
    })
}

export function useFaqs() {
    return useQuery({
        queryKey: ["info", "faqs"],
        staleTime: Infinity,
        queryFn: async () => unwrap(await infoFaqs()),
    })
}

export function useCompatibility() {
    return useQuery({
        queryKey: ["info", "compatibility"],
        staleTime: Infinity,
        queryFn: async () =>
            unwrap(await infoCompatibility()) as Record<string, string[]>,
    })
}

export function useEligibility() {
    return useQuery({
        queryKey: ["info", "eligibility"],
        staleTime: Infinity,
        queryFn: async () => unwrap(await infoEligibility()),
    })
}
