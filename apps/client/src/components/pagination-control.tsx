import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { useI18n } from "@/lib/i18n/context"

interface PaginationControlProps {
    page: number
    totalPages: number
    onChange: (page: number) => void
}

/** Minimal prev/next pager driven by `PageMetaDto`. Hidden when only one page. */
export function PaginationControl({
    page,
    totalPages,
    onChange,
}: PaginationControlProps) {
    const { dictionary } = useI18n()
    if (totalPages <= 1) return null

    return (
        <div className="mt-6 flex items-center justify-center gap-4">
            <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => onChange(page - 1)}
                className="gap-1"
            >
                <RiArrowLeftSLine className="size-4" />
                {dictionary.common.previous}
            </Button>
            <span className="text-sm text-muted-foreground">
                {dictionary.common.page} {page} {dictionary.common.of}{" "}
                {totalPages}
            </span>
            <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => onChange(page + 1)}
                className="gap-1"
            >
                {dictionary.common.next}
                <RiArrowRightSLine className="size-4" />
            </Button>
        </div>
    )
}
