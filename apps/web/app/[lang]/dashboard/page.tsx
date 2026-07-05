import Link from "next/link"
import { Suspense } from "react"
import { connection } from "next/server"
import {
    RiAdminLine,
    RiHeartPulseLine,
    RiInboxLine,
    RiUserHeartLine,
} from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Section } from "@workspace/ui/components/section"
import { AppStatCard } from "@/components/app-stat-card"
import { PrivateNav } from "@/components/private-nav"
import { getPrivateProfile } from "@/lib/api/private-data"
import { getDictionary } from "@/lib/i18n/dictionaries"
import type { Locale } from "@/lib/i18n/config"

interface DashboardPageProps {
    params: Promise<{ lang: Locale }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
    const { lang } = await params
    const dictionary = getDictionary(lang)

    return (
        <Section
            eyebrow={{ icon: <RiHeartPulseLine />, text: "Workspace" }}
            title={dictionary.nav.dashboard}
            description="Manage requests, donor activity, notifications, and admin operations from one place."
            align="left"
        >
            <Suspense fallback={<DashboardFallback />}>
                <DashboardContent lang={lang} />
            </Suspense>
        </Section>
    )
}

async function DashboardContent({ lang }: { lang: Locale }) {
    await connection()
    const user = await getPrivateProfile(lang)

    const actions = [
        {
            href: `/${lang}/requests/new`,
            title: "Create request",
            description: "Submit a blood request for admin review.",
            icon: <RiInboxLine />,
        },
        {
            href: `/${lang}/donor/profile`,
            title: "Donor profile",
            description: "Register, update availability, and review eligibility.",
            icon: <RiUserHeartLine />,
        },
        {
            href: `/${lang}/notifications`,
            title: "Notifications",
            description: "Read request updates and admin announcements.",
            icon: <RiHeartPulseLine />,
        },
        ...(user.role === "admin"
            ? [
                {
                    href: `/${lang}/admin`,
                    title: "Admin console",
                    description:
                        "Review users, requests, donors, and reports.",
                    icon: <RiAdminLine />,
                },
            ]
            : []),
    ]

    return (
        <div className="space-y-8">
            <PrivateNav lang={lang} role={user.role} />
            <div className="grid gap-4 @2xl:grid-cols-3">
                <AppStatCard label="Signed in as" value={user.fullName} />
                <AppStatCard label="Role" value={user.role} />
                <AppStatCard
                    label="Phone verified"
                    value={user.phoneVerified ? "Yes" : "No"}
                />
            </div>
            <div className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-4">
                {actions.map((action) => (
                    <Card key={action.href} className="rounded-lg">
                        <CardContent className="flex h-full flex-col gap-4 p-5">
                            <div className="rounded-lg border border-border bg-background p-2 text-primary [&_svg]:size-5">
                                {action.icon}
                            </div>
                            <div>
                                <h2 className="font-semibold">
                                    {action.title}
                                </h2>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    {action.description}
                                </p>
                            </div>
                            <Button asChild className="mt-auto">
                                <Link href={action.href}>Open</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

function DashboardFallback() {
    return (
        <div className="grid gap-4 @2xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-32 rounded-lg bg-muted" />
            ))}
        </div>
    )
}
