import { Suspense } from "react"
import { connection } from "next/server"
import { RiHeartPulseLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardFooter } from "@workspace/ui/components/card"
import { Section } from "@workspace/ui/components/section"
import { AppEmpty } from "@/components/app-empty"
import { BloodGroupBadge } from "@/components/blood-group-badge"
import { PrivateNav } from "@/components/private-nav"
import { UrgencyBadge } from "@/components/urgency-badge"
import {
    donorAcceptRequestAction,
    donorDeclineRequestAction,
} from "@/lib/actions/private"
import {
    getDonorMatchingRequests,
    getPrivateProfile,
} from "@/lib/api/private-data"
import type { Locale } from "@/lib/i18n/config"

interface DonorRequestsPageProps {
    params: Promise<{ lang: Locale }>
}

export default async function DonorRequestsPage({
    params,
}: DonorRequestsPageProps) {
    const { lang } = await params

    return (
        <Section
            eyebrow={{ icon: <RiHeartPulseLine />, text: "Donor" }}
            title="Matching requests"
            description="Accept or decline requests that match your donor profile."
            align="left"
        >
            <Suspense fallback={<div className="h-80 rounded-lg bg-muted" />}>
                <DonorRequestsContent lang={lang} />
            </Suspense>
        </Section>
    )
}

async function DonorRequestsContent({ lang }: { lang: Locale }) {
    await connection()
    const [user, requests] = await Promise.all([
        getPrivateProfile(lang),
        getDonorMatchingRequests(lang),
    ])

    return (
        <div className="space-y-8">
            <PrivateNav lang={lang} role={user.role} />
            {requests.length === 0 ? (
                <AppEmpty>No matching requests are available now.</AppEmpty>
            ) : (
                <div className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
                    {requests.map((request) => (
                        <Card key={request.id} className="rounded-lg">
                            <CardContent className="space-y-4 p-5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <BloodGroupBadge bloodGroup={request.bloodGroup} />
                                    <UrgencyBadge urgency={request.urgency} />
                                </div>
                                <div>
                                    <h2 className="font-semibold">
                                        {request.patientName}
                                    </h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {request.hospitalName}
                                        {request.location
                                            ? `, ${request.location.name}`
                                            : ""}
                                    </p>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Needed by{" "}
                                    {new Date(request.neededBy).toLocaleDateString(
                                        "en-BD",
                                        { dateStyle: "medium" }
                                    )}
                                </p>
                            </CardContent>
                            <CardFooter className="flex gap-2 px-5 pb-5 pt-0">
                                <form
                                    action={donorAcceptRequestAction.bind(
                                        null,
                                        lang,
                                        request.id
                                    )}
                                >
                                    <Button type="submit" size="sm">
                                        Accept
                                    </Button>
                                </form>
                                <form
                                    action={donorDeclineRequestAction.bind(
                                        null,
                                        lang,
                                        request.id
                                    )}
                                >
                                    <Button
                                        type="submit"
                                        size="sm"
                                        variant="outline"
                                    >
                                        Decline
                                    </Button>
                                </form>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
