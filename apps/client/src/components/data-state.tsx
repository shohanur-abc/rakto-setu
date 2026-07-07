import type { ReactNode } from "react"
import { RiErrorWarningLine, RiInboxLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@/components/spinner"
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@workspace/ui/components/empty"
import { useI18n } from "@/lib/i18n/context"

interface DataStateProps {
    isLoading: boolean
    isError?: boolean
    isEmpty?: boolean
    onRetry?: () => void
    emptyTitle?: string
    emptyDescription?: string
    children: ReactNode
}

/**
 * One consistent wrapper for the loading / error / empty / ready lifecycle of a
 * query. Every data page renders through this so the three non-happy states
 * look identical across the app.
 */
export function DataState({
    isLoading,
    isError,
    isEmpty,
    onRetry,
    emptyTitle,
    emptyDescription,
    children,
}: DataStateProps) {
    const { dictionary } = useI18n()
    const t = dictionary.app.states

    if (isLoading) {
        return (
            <div className="flex min-h-40 items-center justify-center gap-3 text-muted-foreground">
                <Spinner className="size-5" />
                <span className="text-sm">{t.loading}</span>
            </div>
        )
    }

    if (isError) {
        return (
            <Empty className="min-h-40">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <RiErrorWarningLine className="text-destructive" />
                    </EmptyMedia>
                    <EmptyTitle>{t.error}</EmptyTitle>
                </EmptyHeader>
                {onRetry && (
                    <Button variant="outline" size="sm" onClick={onRetry}>
                        {dictionary.app.actions.retry}
                    </Button>
                )}
            </Empty>
        )
    }

    if (isEmpty) {
        return (
            <Empty className="min-h-40">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <RiInboxLine />
                    </EmptyMedia>
                    <EmptyTitle>{emptyTitle ?? t.empty}</EmptyTitle>
                    {emptyDescription && (
                        <EmptyDescription>{emptyDescription}</EmptyDescription>
                    )}
                </EmptyHeader>
            </Empty>
        )
    }

    return <>{children}</>
}
