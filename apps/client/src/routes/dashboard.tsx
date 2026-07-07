import { Link } from "react-router-dom"
import {
    RiArrowRightLine,
    RiDropLine,
    RiHeartPulseLine,
    RiNotification3Line,
    RiShieldUserLine,
} from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { PageHeader } from "@/components/page-header"
import { BloodGroupBadge } from "@/components/blood-group-badge"
import { useAuth } from "@/hooks/use-auth"
import { useI18n } from "@/lib/i18n/context"
import { useUnreadCount } from "@/lib/api/hooks/use-notifications"

// Role-agnostic landing for the authenticated area: a greeting, an unread
// snapshot, and role-appropriate primary actions that lead into the deeper
// role sections in the sidebar.
export function DashboardPage() {
    const { user } = useAuth()
    const { dictionary, localePath } = useI18n()
    const d = dictionary.app.dashboard
    const unread = useUnreadCount(Boolean(user)).data?.count ?? 0

    const actions = buildActions()

    return (
        <>
            <PageHeader
                title={`${d.welcome}, ${user?.fullName ?? ""}`}
                description={d.subtitle}
            />

            <div className="grid gap-4 @2xl:grid-cols-3">
                <Card className="rounded-lg @2xl:col-span-1">
                    <CardContent className="flex items-center gap-4 p-5">
                        <span className="grid size-12 place-items-center rounded-full bg-primary/10">
                            <RiShieldUserLine className="size-6 text-primary" />
                        </span>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {dictionary.app.fields.role}
                            </p>
                            <p className="font-heading text-lg font-semibold capitalize">
                                {user?.role}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-lg">
                    <CardContent className="flex items-center gap-4 p-5">
                        <span className="grid size-12 place-items-center rounded-full bg-primary/10">
                            <RiDropLine className="size-6 text-primary" />
                        </span>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {dictionary.common.bloodGroup}
                            </p>
                            {user?.bloodGroup ? (
                                <BloodGroupBadge bloodGroup={user.bloodGroup} />
                            ) : (
                                <p className="font-medium">—</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-lg">
                    <CardContent className="flex items-center justify-between gap-4 p-5">
                        <div className="flex items-center gap-4">
                            <span className="grid size-12 place-items-center rounded-full bg-primary/10">
                                <RiNotification3Line className="size-6 text-primary" />
                            </span>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {dictionary.app.notifications.title}
                                </p>
                                <p className="font-heading text-lg font-semibold">
                                    {unread} {dictionary.app.notifications.unread}
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" asChild>
                            <Link
                                to={localePath("/notifications")}
                                aria-label={d.openNotifications}
                            >
                                <RiArrowRightLine className="size-5" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <h2 className="mb-4 mt-10 font-heading text-lg font-semibold">
                {d.quickActions}
            </h2>
            <div className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
                {actions.map((action) => (
                    <Card key={action.to} className="rounded-lg">
                        <CardContent className="flex flex-col gap-3 p-5">
                            <span className="grid size-11 place-items-center rounded-full border bg-secondary">
                                <action.icon className="size-5 text-primary" />
                            </span>
                            <div>
                                <p className="font-heading font-semibold">
                                    {action.title}
                                </p>
                                {action.description && (
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {action.description}
                                    </p>
                                )}
                            </div>
                            <Button asChild size="sm" className="mt-1 w-fit gap-1">
                                <Link to={action.to}>
                                    {action.cta}
                                    <RiArrowRightLine className="size-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    )

    function buildActions() {
        const items: {
            to: string
            title: string
            description?: string
            cta: string
            icon: typeof RiDropLine
        }[] = []

        if (user?.role === "recipient") {
            items.push({
                to: localePath("/requests/new"),
                title: dictionary.app.recipient.newTitle,
                description: dictionary.app.recipient.newDesc,
                cta: d.recipientCta,
                icon: RiDropLine,
            })
            items.push({
                to: localePath("/donor/register"),
                title: d.becomeDonor,
                description: d.becomeDonorDesc,
                cta: d.becomeDonor,
                icon: RiHeartPulseLine,
            })
        }

        if (user?.role === "donor") {
            items.push({
                to: localePath("/donor/requests"),
                title: dictionary.app.donor.matchingTitle,
                description: dictionary.app.donor.matchingDesc,
                cta: d.donorCta,
                icon: RiDropLine,
            })
        }

        if (user?.role === "admin") {
            items.push({
                to: localePath("/admin"),
                title: dictionary.app.admin.dashboardTitle,
                description: dictionary.app.admin.dashboardDesc,
                cta: d.adminCta,
                icon: RiShieldUserLine,
            })
        }

        return items
    }
}
