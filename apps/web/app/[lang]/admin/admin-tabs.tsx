import {
    RiDashboardLine,
    RiFileChartLine,
    RiGroupLine,
    RiHandHeartLine,
    RiMegaphoneLine,
    RiSettings3Line,
    RiShieldCheckLine,
    RiUserHeartLine,
} from "@remixicon/react"
import { DashboardTabs } from "@/components/dashboard-tabs"

const adminTabs = [
    { href: "/admin", label: "Dashboard", icon: <RiDashboardLine className="size-4" aria-hidden="true" /> },
    { href: "/admin/users", label: "Users", icon: <RiGroupLine className="size-4" aria-hidden="true" /> },
    { href: "/admin/donors", label: "Donors", icon: <RiUserHeartLine className="size-4" aria-hidden="true" /> },
    { href: "/admin/requests", label: "Requests", icon: <RiHandHeartLine className="size-4" aria-hidden="true" /> },
    { href: "/admin/reports", label: "Reports", icon: <RiFileChartLine className="size-4" aria-hidden="true" /> },
    { href: "/admin/announcements", label: "Announcements", icon: <RiMegaphoneLine className="size-4" aria-hidden="true" /> },
    { href: "/admin/moderation", label: "Moderation", icon: <RiShieldCheckLine className="size-4" aria-hidden="true" /> },
    { href: "/admin/settings", label: "Settings", icon: <RiSettings3Line className="size-4" aria-hidden="true" /> },
] as const

export function AdminTabs({ lang }: { lang: string }) {
    return <DashboardTabs lang={lang} tabs={adminTabs} fallback="/admin" />
}
