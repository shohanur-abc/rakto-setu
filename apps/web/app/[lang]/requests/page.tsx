import Link from "next/link"
import { Suspense } from "react"
import { connection } from "next/server"
import { RiInboxLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Section } from "@workspace/ui/components/section"
import { AppEmpty } from "@/components/app-empty"
import { PrivateNav } from "@/components/private-nav"
import { RequestCard } from "@/components/request-card"
import { getOwnRequests, getPrivateProfile } from "@/lib/api/private-data"
import { getDictionary } from "@/lib/i18n/dictionaries"
import type { Locale } from "@/lib/i18n/config"

interface RequestsPageProps {
    params: Promise<{ lang: Locale }>
}

export default async function RequestsPage({ params }: RequestsPageProps) {
    const { lang } = await params
    const dictionary = getDictionary(lang)

    return (
        <Section
            eyebrow={{ icon: <RiInboxLine />, text: "Recipient" }}
            title="My blood requests"
            description="Create, track, cancel, and complete your own requests."
            align="left"
        >
            <Suspense fallback={<div className="h-80 rounded-lg bg-muted" />}>
                <RequestsContent lang={lang} dictionary={dictionary} />
            </Suspense>
        </Section>
    )
}

async function RequestsContent({
    lang,
    dictionary,
}: {
    lang: Locale
    dictionary: ReturnType<typeof getDictionary>
}) {
    await connection()
    const [user, page] = await Promise.all([
        getPrivateProfile(lang),
        getOwnRequests(lang),
    ])

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-3 @2xl:flex-row @2xl:items-center @2xl:justify-between">
                <PrivateNav lang={lang} role={user.role} />
                <Button asChild>
                    <Link href={`/${lang}/requests/new`}>New request</Link>
                </Button>
            </div>
            {page.items.length === 0 ? (
                <AppEmpty>No requests have been created yet.</AppEmpty>
            ) : (
                <div className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
                    {page.items.map((request) => (
                        <RequestCard
                            key={request.id}
                            request={request}
                            href={`/${lang}/requests/${request.id}`}
                            showStatus
                            labels={{
                                viewDetails: dictionary.common.viewDetails,
                                units: dictionary.requestsPage.units,
                                neededBy: dictionary.requestsPage.neededBy,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
