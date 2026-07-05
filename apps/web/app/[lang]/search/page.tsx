import { Suspense } from "react"
import { connection } from "next/server"
import { RiSearchLine } from "@remixicon/react"
import { Section } from "@workspace/ui/components/section"
import { DonorCard } from "@/components/donor-card"
import { PaginationControls } from "@/components/pagination-controls"
import { SearchFilters } from "@/app/[lang]/search/_client/search-filters"
import { getLocations, searchDonors } from "@/lib/api/public-data"
import { getDictionary } from "@/lib/i18n/dictionaries"
import type { Locale } from "@/lib/i18n/config"
import { publicSearchParamsCache } from "@/lib/url/public-search-params"

interface SearchPageProps {
    params: Promise<{ lang: Locale }>
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SearchPage({
    params,
    searchParams,
}: SearchPageProps) {
    const { lang } = await params
    const dictionary = getDictionary(lang)

    return (
        <Section
            eyebrow={{ icon: <RiSearchLine />, text: dictionary.nav.findBlood }}
            title={dictionary.searchPage.title}
            description={dictionary.searchPage.description}
            align="left"
        >
            <Suspense fallback={<SearchFallback />}>
                <SearchContent
                    dictionary={dictionary}
                    searchParams={searchParams}
                />
            </Suspense>
        </Section>
    )
}

async function SearchContent({
    dictionary,
    searchParams,
}: {
    dictionary: ReturnType<typeof getDictionary>
    searchParams: SearchPageProps["searchParams"]
}) {
    await connection()

    const filters = await publicSearchParamsCache.parse(searchParams)
    const locations = await getLocations().catch(() => [])
    const results = filters.bloodGroup
        ? await searchDonors({
              bloodGroup: filters.bloodGroup,
              locationId: filters.locationId ?? undefined,
              page: filters.page,
              limit: filters.limit,
          }).catch(() => ({
              items: [],
              meta: { page: 1, limit: filters.limit, total: 0, totalPages: 0 },
          }))
        : {
              items: [],
              meta: { page: 1, limit: filters.limit, total: 0, totalPages: 0 },
          }
    const locationById = new Map(
        locations.map((location) => [location.id, location])
    )

    return (
        <div className="space-y-8">
            <SearchFilters
                labels={dictionary.common}
                locations={locations}
                showUrgency={false}
            />

            {!filters.bloodGroup ? (
                <p className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
                    {dictionary.searchPage.emptyPrompt}
                </p>
            ) : results.items.length === 0 ? (
                <p className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
                    {dictionary.common.noResults}
                </p>
            ) : (
                <>
                    <p className="text-sm text-muted-foreground">
                        {results.meta.total}{" "}
                        {dictionary.searchPage.resultCount}
                    </p>
                    <div className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
                        {results.items.map((donor) => {
                            const location = donor.locationId
                                ? locationById.get(donor.locationId)
                                : null

                            return (
                                <DonorCard
                                    key={donor.id}
                                    donor={{
                                        ...donor,
                                        location: location
                                            ? {
                                                  id: location.id,
                                                  name: location.name,
                                              }
                                            : null,
                                    }}
                                    labels={{
                                        totalDonations:
                                            dictionary.searchPage
                                                .totalDonations,
                                    }}
                                />
                            )
                        })}
                    </div>
                    <PaginationControls
                        total={results.meta.total}
                        defaultLimit={filters.limit}
                        labels={dictionary.common}
                    />
                </>
            )}
        </div>
    )
}

function SearchFallback() {
    return (
        <div className="space-y-6">
            <div className="h-16 rounded-lg bg-muted" />
            <div className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-44 rounded-lg bg-muted" />
                ))}
            </div>
        </div>
    )
}
