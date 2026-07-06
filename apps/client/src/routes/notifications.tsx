import { RiCheckDoubleLine, RiNotification3Line } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import { PageHeader } from "@/components/page-header"
import { DataState } from "@/components/data-state"
import {
    useMarkAllRead,
    useMarkNotificationRead,
    useNotifications,
} from "@/lib/api/hooks/use-notifications"
import { useI18n } from "@/lib/i18n/context"
import { formatRelative } from "@/lib/format"

export function NotificationsPage() {
    const { dictionary } = useI18n()
    const t = dictionary.app.notifications
    const query = useNotifications()
    const markRead = useMarkNotificationRead()
    const markAll = useMarkAllRead()

    const notifications = query.data ?? []
    const hasUnread = notifications.some((n) => !n.isRead)

    return (
        <>
            <PageHeader
                title={t.title}
                description={t.description}
                actions={
                    hasUnread ? (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            disabled={markAll.isPending}
                            onClick={() => markAll.mutate()}
                        >
                            <RiCheckDoubleLine className="size-4" />
                            {t.markAll}
                        </Button>
                    ) : undefined
                }
            />

            <DataState
                isLoading={query.isLoading}
                isError={query.isError}
                isEmpty={notifications.length === 0}
                onRetry={() => query.refetch()}
                emptyTitle={t.empty}
            >
                <div className="flex flex-col gap-2">
                    {notifications.map((item) => (
                        <Card
                            key={item.id}
                            className={cn(
                                "rounded-lg transition-colors",
                                !item.isRead && "border-primary/40 bg-primary/5"
                            )}
                        >
                            <CardContent className="flex items-start gap-3 p-4">
                                <span
                                    className={cn(
                                        "mt-1 grid size-8 shrink-0 place-items-center rounded-full",
                                        item.isRead
                                            ? "bg-muted text-muted-foreground"
                                            : "bg-primary/10 text-primary"
                                    )}
                                >
                                    <RiNotification3Line className="size-4" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="font-medium">
                                            {item.title}
                                        </p>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {formatRelative(item.createdAt)}
                                        </span>
                                    </div>
                                    <p className="mt-0.5 text-sm text-muted-foreground">
                                        {item.body}
                                    </p>
                                </div>
                                {!item.isRead && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => markRead.mutate(item.id)}
                                    >
                                        {dictionary.app.actions.confirm}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </DataState>
        </>
    )
}
