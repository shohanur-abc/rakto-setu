import { Suspense } from "react"
import { connection } from "next/server"
import { Card, CardContent } from "@workspace/ui/components/card"
import { BloodGroups } from "@/app/[lang]/04-blood-groups"
import { Availability } from "@/app/[lang]/02-availability"
import { Hero } from "@/app/[lang]/01-hero"
import { HowItWorks } from "@/app/[lang]/03-how-it-works"
import { getDictionary } from "@/lib/i18n/dictionaries"
import type { Locale } from "@/lib/i18n/config"

export default async function HomePage({
    params,
}: {
    params: Promise<{ lang: Locale }>
}) {
    const { lang } = await params
    const dictionary = getDictionary(lang)

    return (
        <Suspense fallback={<HomeFallback />}>
            <HomeContent lang={lang} dictionary={dictionary} />
        </Suspense>
    )
}

async function HomeContent({
    lang,
    dictionary,
}: {
    lang: Locale
    dictionary: ReturnType<typeof getDictionary>
}) {
    await connection()

    return (
        <>
            <Hero lang={lang} dictionary={dictionary} />
            <Availability dictionary={dictionary} />
            <HowItWorks dictionary={dictionary} />
            <BloodGroups dictionary={dictionary} />
        </>
    )
}

function HomeFallback() {
    return (
        <section className="@container border-b border-border">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 @2xl:px-6 @5xl:grid-cols-2">
                <div className="space-y-4">
                    <div className="h-5 w-40 rounded bg-muted" />
                    <div className="h-12 w-3/4 rounded bg-muted" />
                    <div className="h-5 w-full max-w-xl rounded bg-muted" />
                    <div className="h-10 w-full max-w-lg rounded bg-muted" />
                </div>
                <Card className="rounded-lg">
                    <CardContent className="space-y-3 p-5">
                        <div className="h-12 rounded bg-muted" />
                        <div className="h-12 rounded bg-muted" />
                        <div className="h-12 rounded bg-muted" />
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}
