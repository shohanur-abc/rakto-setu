"use client"

import { Button } from "@workspace/ui/components/button"
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react"
import { useQueryState, parseAsInteger } from "nuqs"

interface PaginationControlsProps {
    total: number
    defaultLimit?: number
    labels?: {
        page?: string
        of?: string
        previous?: string
        next?: string
    }
    className?: string
}

export function PaginationControls({
    total,
    defaultLimit = 10,
    labels,
    className,
}: PaginationControlsProps) {
    const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1))
    const [limit] = useQueryState(
        "limit",
        parseAsInteger.withDefault(defaultLimit)
    )

    const totalPages = Math.ceil(total / limit)

    if (totalPages <= 1) return null

    return (
        <div
            className={`flex items-center justify-center gap-2 ${className ?? ""}`}
        >
            <Button
                id="pagination-prev"
                variant="outline"
                size="icon"
                onClick={() =>
                    setPage(Math.max(1, page - 1), { shallow: false })
                }
                disabled={page <= 1}
                aria-label={labels?.previous ?? "Previous page"}
            >
                <RiArrowLeftSLine className="size-4" />
            </Button>

            <span className="text-sm text-muted-foreground">
                {labels?.page ?? "Page"} {page} {labels?.of ?? "of"}{" "}
                {totalPages}
            </span>

            <Button
                id="pagination-next"
                variant="outline"
                size="icon"
                onClick={() =>
                    setPage(Math.min(totalPages, page + 1), { shallow: false })
                }
                disabled={page >= totalPages}
                aria-label={labels?.next ?? "Next page"}
            >
                <RiArrowRightSLine className="size-4" />
            </Button>
        </div>
    )
}
