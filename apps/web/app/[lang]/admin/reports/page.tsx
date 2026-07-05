import { Suspense } from "react"
import { connection } from "next/server"
import { RiBarChartLine } from "@remixicon/react"
import { Section } from "@workspace/ui/components/section"
import { AppEmpty } from "@/components/app-empty"
import { AppStatCard } from "@/components/app-stat-card"
import { AppTable } from "@/components/app-table"
import { PrivateNav } from "@/components/private-nav"
import {
    getAdminModerationQueue,
    getAdminReports,
    getPrivateProfile,
} from "@/lib/api/private-data"
import type { Locale } from "@/lib/i18n/config"

interface AdminReportsPageProps {
    params: Promise<{ lang: Locale }>
}

export default async function AdminReportsPage({
    params,
}: AdminReportsPageProps) {
    const { lang } = await params

    return (
        <Section
            eyebrow={{ icon: <RiBarChartLine />, text: "Admin" }}
            title="Reports"
            description="Monitor request status distribution, donations, and moderation queue."
            align="left"
        >
            <Suspense fallback={<div className="h-96 rounded-lg bg-muted" />}>
                <AdminReportsContent lang={lang} />
            </Suspense>
        </Section>
    )
}

async function AdminReportsContent({ lang }: { lang: Locale }) {
    await connection()
    const [user, report, moderationQueue] = await Promise.all([
        getPrivateProfile(lang),
        getAdminReports(lang),
        getAdminModerationQueue(lang),
    ])

    return (
        <div className="space-y-8">
            <PrivateNav lang={lang} role={user.role} />
            <div className="grid gap-4 @2xl:grid-cols-2">
                <AppStatCard label="Completed donations" value={report.donations} />
                <AppStatCard
                    label="Moderation queue"
                    value={moderationQueue.length}
                />
            </div>
            <AppTable
                headers={["Status", "Count"]}
                rows={report.requestsByStatus.map((row) => [
                    row.status,
                    row.count,
                ])}
            />
            {moderationQueue.length === 0 && (
                <AppEmpty>No moderation items are pending.</AppEmpty>
            )}
        </div>
    )
}
