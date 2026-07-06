import { Card, CardContent } from "@workspace/ui/components/card"
import { PageHeader } from "@/components/page-header"
import { DataState } from "@/components/data-state"
import { useAdminModeration } from "@/lib/api/hooks/use-admin"
import { useI18n } from "@/lib/i18n/context"

export function AdminModerationPage() {
    const { dictionary } = useI18n()
    const t = dictionary.app.admin
    const query = useAdminModeration()
    const items = query.data ?? []

    return (
        <>
            <PageHeader title={t.moderationTitle} description={t.moderationDesc} />
            <DataState
                isLoading={query.isLoading}
                isError={query.isError}
                isEmpty={items.length === 0}
                onRetry={() => query.refetch()}
                emptyTitle={dictionary.app.notifications.empty}
            >
                <div className="flex flex-col gap-3">
                    {items.map((item, index) => (
                        <Card key={index} className="rounded-lg">
                            <CardContent className="p-4">
                                <pre className="overflow-x-auto text-xs text-muted-foreground">
                                    {JSON.stringify(item, null, 2)}
                                </pre>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </DataState>
        </>
    )
}
