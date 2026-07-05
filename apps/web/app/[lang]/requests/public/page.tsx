import { Suspense } from "react"
import { connection } from "next/server"
import { RiClipboardLine } from "@remixicon/react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Section } from "@workspace/ui/components/section"
import { PaginationControls } from "@/components/pagination-controls"
import { RequestCard } from "@/components/request-card"
import { SearchFilters } from "@/app/[lang]/search/_client/search-filters"
import { getDictionary } from "@/lib/i18n/dictionaries"
import { getLocations, getPublicRequests } from "@/lib/api/public-data"
import type { Locale } from "@/lib/i18n/config"
import { publicSearchParamsCache } from "@/lib/url/public-search-params"

interface PublicRequestsPageProps {
    params: Promise<{ lang: Locale }>
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function PublicRequestsPage({
    params,
    searchParams,
}: PublicRequestsPageProps) {
    const { lang } = await params
    const dictionary = getDictionary(lang)

    return (
        <Section
            eyebrow={{
                icon: <RiClipboardLine />,
                text: dictionary.nav.activeRequests,
            }}
            title={dictionary.requestsPage.title}
            description={dictionary.requestsPage.description}
            align="left"
        >
            <Suspense fallback={<PublicRequestsFallback />}>
                <PublicRequestsContent
                    lang={lang}
                    dictionary={dictionary}
                    searchParams={searchParams}
                />
            </Suspense>
        </Section>
    )
}

async function PublicRequestsContent({
    lang,
    dictionary,
    searchParams,
}: {
    lang: Locale
    dictionary: ReturnType<typeof getDictionary>
    searchParams: PublicRequestsPageProps["searchParams"]
}) {
    await connection()

    const filters = await publicSearchParamsCache.parse(searchParams)
    const [locations, results] = await Promise.all([
        getLocations(),
        getPublicRequests({
            page: filters.page,
            limit: filters.limit,
            bloodGroup: filters.bloodGroup ?? undefined,
            locationId: filters.locationId ?? undefined,
            urgency: filters.urgency ?? undefined,
        }),
    ])

    return (
        <div className="space-y-8">
            <SearchFilters
                labels={dictionary.common}
                locations={locations}
                showUrgency
            />

            <Alert className="rounded-lg">
                <AlertDescription>
                    {dictionary.requestsPage.publishedOnly}{" "}
                    {dictionary.common.safety}
                </AlertDescription>
            </Alert>

            {results.items.length === 0 ? (
                <p className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
                    {dictionary.common.noResults}
                </p>
            ) : (
                <>
                    <div className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
                        {results.items.map((request) => (
                            <RequestCard
                                key={request.id}
                                request={request}
                                href={`/${lang}/requests/public/${request.id}`}
                                labels={{
                                    viewDetails: dictionary.common.viewDetails,
                                    units: dictionary.requestsPage.units,
                                    neededBy:
                                        dictionary.requestsPage.neededBy,
                                }}
                            />
                        ))}
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

function PublicRequestsFallback() {
    return (
        <div className="space-y-6">
            <div className="h-16 rounded-lg bg-muted" />
            <div className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-56 rounded-lg bg-muted" />
                ))}
            </div>
        </div>
    )
}
