import { Link } from "react-router-dom"
import { parseAsInteger, useQueryState } from "nuqs"
import { RiAddLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { PageHeader } from "@/components/page-header"
import { DataState } from "@/components/data-state"
import { RequestCard } from "@/components/request-card"
import { PaginationControl } from "@/components/pagination-control"
import { useOwnRequests } from "@/lib/api/hooks/use-requests"
import { useI18n } from "@/lib/i18n/context"

export function RecipientRequestsPage() {
    const { dictionary, localePath } = useI18n()
    const t = dictionary.app.recipient
    const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1))
    const query = useOwnRequests({ page, limit: 12 })

    const requests = query.data?.items ?? []
    const meta = query.data?.meta

    return (
        <>
            <PageHeader
                title={t.requestsTitle}
                description={t.requestsDesc}
                actions={
                    <Button asChild size="sm" className="gap-1.5">
                        <Link to={localePath("/requests/new")}>
                            <RiAddLine className="size-4" />
                            {dictionary.app.nav.newRequest}
                        </Link>
                    </Button>
                }
            />

            <DataState
                isLoading={query.isLoading}
                isError={query.isError}
                isEmpty={requests.length === 0}
                onRetry={() => query.refetch()}
                emptyDescription={t.newDesc}
            >
                <div className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
                    {requests.map((request) => (
                        <RequestCard
                            key={request.id}
                            request={request}
                            href={localePath(`/requests/${request.id}`)}
                            showStatus
                        />
                    ))}
                </div>
                {meta && (
                    <PaginationControl
                        page={meta.page}
                        totalPages={meta.totalPages}
                        onChange={setPage}
                    />
                )}
            </DataState>
        </>
    )
}
