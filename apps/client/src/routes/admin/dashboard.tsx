import {
    RiFileList3Line,
    RiGroupLine,
    RiHeartPulseLine,
    RiTimeLine,
    RiCheckboxCircleLine,
    RiShieldCheckLine,
    type RemixiconComponentType,
} from "@remixicon/react"
import { Card, CardContent } from "@workspace/ui/components/card"
import { PageHeader } from "@/components/page-header"
import { DataState } from "@/components/data-state"
import { useAdminDashboard } from "@/lib/api/hooks/use-admin"
import { useI18n } from "@/lib/i18n/context"

export function AdminDashboardPage() {
    const { dictionary } = useI18n()
    const t = dictionary.app.admin
    const m = t.metrics
    const query = useAdminDashboard()
    const data = query.data

    const cards: {
        label: string
        value: number
        icon: RemixiconComponentType
        accent?: boolean
    }[] = data
        ? [
              { label: m.users, value: data.users, icon: RiGroupLine },
              {
                  label: m.activeDonors,
                  value: data.activeDonors,
                  icon: RiHeartPulseLine,
              },
              {
                  label: m.pendingDonors,
                  value: data.pendingDonors,
                  icon: RiShieldCheckLine,
                  accent: true,
              },
              {
                  label: m.pendingRequests,
                  value: data.pendingRequests,
                  icon: RiTimeLine,
                  accent: true,
              },
              {
                  label: m.publishedRequests,
                  value: data.publishedRequests,
                  icon: RiFileList3Line,
              },
              {
                  label: m.fulfilledRequests,
                  value: data.fulfilledRequests,
                  icon: RiCheckboxCircleLine,
              },
          ]
        : []

    return (
        <>
            <PageHeader title={t.dashboardTitle} description={t.dashboardDesc} />
            <DataState
                isLoading={query.isLoading}
                isError={query.isError}
                onRetry={() => query.refetch()}
            >
                <div className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
                    {cards.map((card) => (
                        <Card key={card.label} className="rounded-lg">
                            <CardContent className="flex items-center gap-4 p-5">
                                <span
                                    className={
                                        card.accent
                                            ? "grid size-12 place-items-center rounded-full bg-amber-500/10"
                                            : "grid size-12 place-items-center rounded-full bg-primary/10"
                                    }
                                >
                                    <card.icon
                                        className={
                                            card.accent
                                                ? "size-6 text-amber-500"
                                                : "size-6 text-primary"
                                        }
                                    />
                                </span>
                                <div>
                                    <p className="font-heading text-3xl font-bold">
                                        {card.value}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {card.label}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </DataState>
        </>
    )
}
