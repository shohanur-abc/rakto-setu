"use client"

import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@workspace/ui/components/button"
import {
    getNotificationsListQueryKey,
    getNotificationsUnreadCountQueryKey,
    useNotificationsList,
    useNotificationsMarkAllRead,
    useNotificationsMarkRead,
    useNotificationsUnreadCount,
} from "api-client/src/notifications"
import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { ApiSection, EmptyState, ErrorState, FieldList, LoadingRows } from "@/components/api-surface"

export function NotificationsClient() {
    const queryClient = useQueryClient()
    const list = useNotificationsList()
    const unread = useNotificationsUnreadCount()
    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: getNotificationsListQueryKey() })
        queryClient.invalidateQueries({ queryKey: getNotificationsUnreadCountQueryKey() })
    }
    const markRead = useNotificationsMarkRead({ mutation: { onSuccess: invalidate } })
    const markAll = useNotificationsMarkAllRead({ mutation: { onSuccess: invalidate } })

    return (
        <>
            <PageHeader eyebrow="Notifications" title="Notifications" subtitle="List, unread count, mark one read, and mark all read." />
            <Container className="space-y-4 py-10 @2xl:py-12">
                <ApiSection title={`Unread count: ${unread.data?.count ?? "..."}`} description="GET /api/v1/notifications/unread-count">
                    {unread.error && <ErrorState error={unread.error} />}
                    <Button onClick={() => markAll.mutate()} disabled={markAll.isPending} variant="outline">
                        Mark all read
                    </Button>
                    {markAll.error && <ErrorState error={markAll.error} />}
                </ApiSection>
                <ApiSection title="Notification list" description="GET /api/v1/notifications and PATCH /api/v1/notifications/{id}/read">
                    {list.error ? (
                        <ErrorState error={list.error} />
                    ) : list.isLoading ? (
                        <LoadingRows />
                    ) : list.data?.length ? (
                        <div className="space-y-3">
                            {list.data.map((item) => (
                                <div key={item.id} className="rounded-lg border border-border p-3">
                                    <FieldList
                                        items={[
                                            ["Title", item.title],
                                            ["Type", item.type],
                                            ["Channel", item.channel],
                                            ["Read", item.isRead ? "Yes" : "No"],
                                        ]}
                                    />
                                    <p className="mt-3 text-sm text-muted-foreground">{item.body}</p>
                                    <Button className="mt-3" size="sm" onClick={() => markRead.mutate({ id: item.id })} disabled={markRead.isPending || item.isRead}>
                                        Mark read
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState />
                    )}
                    {markRead.error && <ErrorState error={markRead.error} />}
                </ApiSection>
            </Container>
        </>
    )
}
