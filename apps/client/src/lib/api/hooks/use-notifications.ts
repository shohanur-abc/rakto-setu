import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
    notificationsList,
    notificationsMarkAllRead,
    notificationsMarkRead,
    notificationsUnreadCount,
} from "@/lib/api/generated/rakto-setu"
import { unwrap } from "@/lib/api/unwrap"
import { queryKeys } from "@/lib/api/query-keys"

// The list/unread responses are typed loosely by the spec; model the shapes we
// rely on here so pages get useful types.
export interface NotificationItem {
    id: string
    title: string
    body: string
    type: string
    isRead: boolean
    createdAt: string
}

export function useNotifications(enabled = true) {
    return useQuery({
        queryKey: queryKeys.notifications.list,
        enabled,
        queryFn: async () =>
            unwrap(await notificationsList()) as unknown as NotificationItem[],
    })
}

export function useUnreadCount(enabled = true) {
    return useQuery({
        queryKey: queryKeys.notifications.unread,
        enabled,
        refetchInterval: 60_000,
        queryFn: async () =>
            unwrap(await notificationsUnreadCount()) as unknown as {
                count: number
            },
    })
}

export function useMarkNotificationRead() {
    const client = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) =>
            unwrap(await notificationsMarkRead(id)),
        onSuccess: () =>
            client.invalidateQueries({ queryKey: ["notifications"] }),
    })
}

export function useMarkAllRead() {
    const client = useQueryClient()
    return useMutation({
        mutationFn: async () => unwrap(await notificationsMarkAllRead()),
        onSuccess: () =>
            client.invalidateQueries({ queryKey: ["notifications"] }),
    })
}
