import { RiMegaphoneLine } from "@remixicon/react"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { Section } from "@workspace/ui/components/section"
import { DataState } from "@/components/data-state"
import { useAnnouncements } from "@/lib/api/public-data"
import { useI18n } from "@/lib/i18n/context"
import { formatDate } from "@/lib/format"

export function AnnouncementsPage() {
    const { dictionary } = useI18n()
    const query = useAnnouncements()
    const announcements = query.data ?? []

    return (
        <Section
            eyebrow={{
                icon: <RiMegaphoneLine />,
                text: dictionary.app.nav.announcements,
            }}
            title={dictionary.app.admin.announcementsTitle}
            align="left"
        >
            <DataState
                isLoading={query.isLoading}
                isError={query.isError}
                isEmpty={announcements.length === 0}
                onRetry={() => query.refetch()}
            >
                <div className="mx-auto flex max-w-3xl flex-col gap-4">
                    {announcements.map((item) => (
                        <Card key={item.id} className="rounded-lg">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-3">
                                    <h3 className="font-heading text-lg font-semibold">
                                        {item.title}
                                    </h3>
                                    <span className="shrink-0 text-xs text-muted-foreground">
                                        {formatDate(item.createdAt)}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                                    {item.body}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </DataState>
        </Section>
    )
}
