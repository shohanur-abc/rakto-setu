import { NavLink, Outlet } from "react-router-dom"
import {
    RiDashboardLine,
    RiDropLine,
    RiFileList3Line,
    RiHeartPulseLine,
    RiHistoryLine,
    RiMegaphoneLine,
    RiNotification3Line,
    RiSettings3Line,
    RiShieldCheckLine,
    RiUser3Line,
    RiGroupLine,
    RiBarChart2Line,
    RiFlag2Line,
    type RemixiconComponentType,
} from "@remixicon/react"
import { cn } from "@workspace/ui/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { useI18n } from "@/lib/i18n/context"

interface NavItem {
    to: string
    label: string
    icon: RemixiconComponentType
    end?: boolean
}

/** Shell for every authenticated page: a role-aware side nav + content Outlet. */
export function DashboardLayout() {
    const { dictionary, localePath } = useI18n()
    const { user } = useAuth()
    const nav = dictionary.app.nav
    const role = user?.role

    // Build the nav from the user's role. Common items first, then role-scoped.
    const groups: { heading?: string; items: NavItem[] }[] = [
        {
            items: [
                {
                    to: localePath("/dashboard"),
                    label: nav.overview,
                    icon: RiDashboardLine,
                    end: true,
                },
                {
                    to: localePath("/notifications"),
                    label: dictionary.app.notifications.title,
                    icon: RiNotification3Line,
                },
                {
                    to: localePath("/profile"),
                    label: nav.profile,
                    icon: RiUser3Line,
                },
            ],
        },
    ]

    if (role === "recipient") {
        groups.push({
            heading: dictionary.nav.dashboard,
            items: [
                {
                    to: localePath("/requests"),
                    label: nav.myRequests,
                    icon: RiFileList3Line,
                    end: true,
                },
                {
                    to: localePath("/requests/new"),
                    label: nav.newRequest,
                    icon: RiDropLine,
                },
            ],
        })
    }

    if (role === "donor") {
        groups.push({
            heading: dictionary.app.donor.title,
            items: [
                {
                    to: localePath("/donor"),
                    label: nav.overview,
                    icon: RiHeartPulseLine,
                    end: true,
                },
                {
                    to: localePath("/donor/requests"),
                    label: nav.donorRequests,
                    icon: RiDropLine,
                },
                {
                    to: localePath("/donor/donations"),
                    label: nav.donations,
                    icon: RiHistoryLine,
                },
                {
                    to: localePath("/donor/profile"),
                    label: nav.donorProfile,
                    icon: RiUser3Line,
                },
            ],
        })
    }

    if (role === "admin") {
        groups.push({
            heading: dictionary.app.admin.dashboardTitle,
            items: [
                {
                    to: localePath("/admin"),
                    label: nav.overview,
                    icon: RiDashboardLine,
                    end: true,
                },
                {
                    to: localePath("/admin/users"),
                    label: nav.users,
                    icon: RiGroupLine,
                },
                {
                    to: localePath("/admin/donors"),
                    label: nav.donorsQueue,
                    icon: RiShieldCheckLine,
                },
                {
                    to: localePath("/admin/requests"),
                    label: nav.allRequests,
                    icon: RiFileList3Line,
                },
                {
                    to: localePath("/admin/announcements"),
                    label: nav.announcements,
                    icon: RiMegaphoneLine,
                },
                {
                    to: localePath("/admin/reports"),
                    label: nav.reports,
                    icon: RiBarChart2Line,
                },
                {
                    to: localePath("/admin/moderation"),
                    label: nav.moderation,
                    icon: RiFlag2Line,
                },
                {
                    to: localePath("/admin/settings"),
                    label: nav.settings,
                    icon: RiSettings3Line,
                },
            ],
        })
    }

    return (
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 @2xl:px-6 @5xl:grid-cols-[220px_1fr]">
            <aside className="@5xl:sticky @5xl:top-20 @5xl:h-fit">
                <nav className="flex gap-1 overflow-x-auto pb-2 @5xl:flex-col @5xl:overflow-visible @5xl:pb-0">
                    {groups.map((group, index) => (
                        <div
                            key={index}
                            className="flex gap-1 @5xl:flex-col @5xl:gap-0.5"
                        >
                            {group.heading && (
                                <p className="hidden px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground @5xl:block">
                                    {group.heading}
                                </p>
                            )}
                            {group.items.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        cn(
                                            "flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-primary/10 text-primary"
                                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                        )
                                    }
                                >
                                    <item.icon className="size-4 shrink-0" />
                                    <span className="whitespace-nowrap">
                                        {item.label}
                                    </span>
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>
            </aside>
            <div className="min-w-0">
                <Outlet />
            </div>
        </div>
    )
}
