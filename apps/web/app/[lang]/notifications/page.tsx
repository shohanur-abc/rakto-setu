import { Suspense } from "react"
import { connection } from "next/server"
import { RiNotification3Line } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Section } from "@workspace/ui/components/section"
import { AppEmpty } from "@/components/app-empty"
import { PrivateNav } from "@/components/private-nav"
import {
    markAllNotificationsReadAction,
    markNotificationReadAction,
} from "@/lib/actions/private"
import {
    getNotifications,
    getPrivateProfile,
    getUnreadCount,
} from "@/lib/api/private-data"
import type { Locale } from "@/lib/i18n/config"

interface NotificationsPageProps {
    params: Promise<{ lang: Locale }>
}

export default async function NotificationsPage({
    params,
}: NotificationsPageProps) {
    const { lang } = await params

    return (
        <Section
            eyebrow={{ icon: <RiNotification3Line />, text: "Notifications" }}
            title="Notifications"
            description="Account messages, OTP records, request updates, and announcements."
            align="left"
        >
            <Suspense fallback={<div className="h-80 rounded-lg bg-muted" />}>
                <NotificationsContent lang={lang} />
            </Suspense>
        </Section>
    )
}

async function NotificationsContent({ lang }: { lang: Locale }) {
    await connection()
    const [user, notifications, unread] = await Promise.all([
        getPrivateProfile(lang),
        getNotifications(lang),
        getUnreadCount(lang),
    ])

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-3 @2xl:flex-row @2xl:items-center @2xl:justify-between">
                <PrivateNav lang={lang} role={user.role} />
                <form action={markAllNotificationsReadAction.bind(null, lang)}>
                    <Button type="submit" variant="outline">
                        Mark all read ({unread.count})
                    </Button>
                </form>
            </div>
            {notifications.length === 0 ? (
                <AppEmpty>No notifications yet.</AppEmpty>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <Card
                            key={notification.id}
                            className="rounded-lg"
                            data-unread={!notification.isRead}
                        >
                            <CardContent className="flex flex-col gap-4 p-5 @2xl:flex-row @2xl:items-start @2xl:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="font-semibold">
                                            {notification.title}
                                        </h2>
                                        {!notification.isRead && (
                                            <span className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                                                New
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        {notification.body}
                                    </p>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        {new Date(
                                            notification.createdAt
                                        ).toLocaleString("en-BD")}
                                    </p>
                                </div>
                                {!notification.isRead && (
                                    <form
                                        action={markNotificationReadAction.bind(
                                            null,
                                            lang,
                                            notification.id
                                        )}
                                    >
                                        <Button
                                            type="submit"
                                            size="sm"
                                            variant="outline"
                                        >
                                            Mark read
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
