import Link from "next/link"
import { Suspense } from "react"
import { connection } from "next/server"
import {
    RiAdminLine,
    RiBarChartLine,
    RiFileList3Line,
    RiSettings3Line,
    RiUserHeartLine,
    RiUserLine,
} from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Section } from "@workspace/ui/components/section"
import { AppStatCard } from "@/components/app-stat-card"
import { PrivateNav } from "@/components/private-nav"
import { getAdminDashboard, getPrivateProfile } from "@/lib/api/private-data"
import type { Locale } from "@/lib/i18n/config"

interface AdminPageProps {
    params: Promise<{ lang: Locale }>
}

export default async function AdminPage({ params }: AdminPageProps) {
    const { lang } = await params

    return (
        <Section
            eyebrow={{ icon: <RiAdminLine />, text: "Admin" }}
            title="Admin console"
            description="Moderate donors, requests, users, reports, settings, and announcements."
            align="left"
        >
            <Suspense fallback={<div className="h-96 rounded-lg bg-muted" />}>
                <AdminContent lang={lang} />
            </Suspense>
        </Section>
    )
}

async function AdminContent({ lang }: { lang: Locale }) {
    await connection()
    const [user, dashboard] = await Promise.all([
        getPrivateProfile(lang),
        getAdminDashboard(lang),
    ])
    const links = [
        { href: "users", label: "Users", icon: <RiUserLine /> },
        { href: "donors", label: "Donors", icon: <RiUserHeartLine /> },
        { href: "requests", label: "Requests", icon: <RiFileList3Line /> },
        { href: "reports", label: "Reports", icon: <RiBarChartLine /> },
        { href: "settings", label: "Settings", icon: <RiSettings3Line /> },
        { href: "announcements", label: "Announcements", icon: <RiAdminLine /> },
    ]

    return (
        <div className="space-y-8">
            <PrivateNav lang={lang} role={user.role} />
            <div className="grid gap-4 @2xl:grid-cols-3 @5xl:grid-cols-6">
                <AppStatCard label="Users" value={dashboard.users} />
                <AppStatCard label="Active donors" value={dashboard.activeDonors} />
                <AppStatCard label="Pending donors" value={dashboard.pendingDonors} />
                <AppStatCard
                    label="Pending requests"
                    value={dashboard.pendingRequests}
                />
                <AppStatCard
                    label="Published"
                    value={dashboard.publishedRequests}
                />
                <AppStatCard
                    label="Fulfilled"
                    value={dashboard.fulfilledRequests}
                />
            </div>
            <div className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
                {links.map((link) => (
                    <Card key={link.href} className="rounded-lg">
                        <CardContent className="flex items-center justify-between gap-4 p-5">
                            <div className="flex items-center gap-3">
                                <span className="text-primary [&_svg]:size-5">
                                    {link.icon}
                                </span>
                                <h2 className="font-semibold">{link.label}</h2>
                            </div>
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/${lang}/admin/${link.href}`}>
                                    Open
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
