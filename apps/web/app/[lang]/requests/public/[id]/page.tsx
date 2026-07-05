import Link from "next/link"
import { Suspense } from "react"
import { connection } from "next/server"
import { notFound } from "next/navigation"
import {
    RiArrowLeftLine,
    RiCalendarScheduleLine,
    RiHospitalLine,
    RiMapPinLine,
    RiShieldCheckLine,
    RiUserHeartLine,
} from "@remixicon/react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { Section } from "@workspace/ui/components/section"
import { BloodGroupBadge } from "@/components/blood-group-badge"
import { RequestStatusBadge } from "@/components/request-status-badge"
import { UrgencyBadge } from "@/components/urgency-badge"
import { getPublicRequest } from "@/lib/api/public-data"
import { getDictionary } from "@/lib/i18n/dictionaries"
import type { Locale } from "@/lib/i18n/config"

interface PublicRequestDetailPageProps {
    params: Promise<{ lang: Locale; id: string }>
}

export default async function PublicRequestDetailPage({
    params,
}: PublicRequestDetailPageProps) {
    return (
        <Suspense fallback={<PublicRequestDetailFallback />}>
            <PublicRequestDetailContent params={params} />
        </Suspense>
    )
}

async function PublicRequestDetailContent({
    params,
}: PublicRequestDetailPageProps) {
    await connection()

    const { lang, id } = await params
    const dictionary = getDictionary(lang)

    let request: Awaited<ReturnType<typeof getPublicRequest>>

    try {
        request = await getPublicRequest(id)
    } catch {
        notFound()
    }

    const neededBy = new Date(request.neededBy).toLocaleString(
        lang === "bn" ? "bn-BD" : "en-BD",
        { dateStyle: "medium", timeStyle: "short" }
    )

    return (
        <Section
            eyebrow={{
                icon: <RiUserHeartLine />,
                text: dictionary.nav.activeRequests,
            }}
            title={`${request.bloodGroup} · ${request.hospitalName}`}
            description={dictionary.requestsPage.description}
            align="left"
        >
            <div className="mx-auto max-w-4xl space-y-6">
                <Button variant="ghost" asChild className="gap-2 px-0">
                    <Link href={`/${lang}/requests/public`}>
                        <RiArrowLeftLine className="size-4" />
                        {dictionary.nav.activeRequests}
                    </Link>
                </Button>

                <Card className="rounded-lg">
                    <CardContent className="space-y-6 p-6">
                        <div className="flex flex-wrap items-center gap-2">
                            <BloodGroupBadge
                                bloodGroup={request.bloodGroup}
                                size="lg"
                            />
                            <UrgencyBadge urgency={request.urgency} />
                            <RequestStatusBadge status={request.status} />
                            <Badge variant="outline">
                                {request.unitsNeeded}{" "}
                                {dictionary.requestsPage.units}
                            </Badge>
                        </div>

                        <Separator />

                        <div className="grid gap-4 @2xl:grid-cols-2">
                            <DetailItem
                                icon={<RiUserHeartLine />}
                                label={dictionary.requestsPage.patient}
                                value={
                                    request.patientAge
                                        ? `${request.patientName} · ${request.patientAge}`
                                        : request.patientName
                                }
                            />
                            <DetailItem
                                icon={<RiHospitalLine />}
                                label={dictionary.requestsPage.hospital}
                                value={request.hospitalName}
                            />
                            <DetailItem
                                icon={<RiMapPinLine />}
                                label={dictionary.common.location}
                                value={request.location?.name ?? request.locationId}
                            />
                            <DetailItem
                                icon={<RiCalendarScheduleLine />}
                                label={dictionary.requestsPage.neededBy}
                                value={neededBy}
                            />
                        </div>

                        {request.notes && (
                            <>
                                <Separator />
                                <div>
                                    <h3 className="text-sm font-semibold">
                                        {dictionary.requestsPage.notes}
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        {request.notes}
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Alert className="rounded-lg">
                    <RiShieldCheckLine className="size-4" />
                    <AlertDescription>
                        {dictionary.requestsPage.publishedOnly}{" "}
                        {dictionary.common.safety}
                    </AlertDescription>
                </Alert>
            </div>
        </Section>
    )
}

function PublicRequestDetailFallback() {
    return (
        <Section align="left">
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="h-9 w-32 rounded bg-muted" />
                <div className="h-96 rounded-lg bg-muted" />
                <div className="h-20 rounded-lg bg-muted" />
            </div>
        </Section>
    )
}

function DetailItem({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode
    label: string
    value: string
}) {
    return (
        <div className="rounded-lg border border-border bg-background p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground [&_svg]:size-4">
                {icon}
                <span>{label}</span>
            </div>
            <p className="font-medium">{value}</p>
        </div>
    )
}
