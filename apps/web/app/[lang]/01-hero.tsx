import Link from "next/link"
import { RiArrowRightSLine, RiHeartPulseLine } from "@remixicon/react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { HeroSearchForm } from "@/app/[lang]/_client/01-hero"
import { getLocations } from "@/lib/api/public-data"
import type { Dictionary } from "@/lib/i18n/dictionaries"
import type { Locale } from "@/lib/i18n/config"

export async function Hero({
    lang,
    dictionary,
}: {
    lang: Locale
    dictionary: Dictionary
}) {
    const locations = await getLocations().catch(() => [])
    const hero = dictionary.home.hero

    return (
        <section className="@container isolate overflow-hidden border-b border-border bg-background">
            <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 @2xl:px-6 @5xl:grid-cols-[1.05fr_0.95fr] @5xl:items-center @5xl:py-24">
                <div className="max-w-3xl">
                    <Badge
                        variant="outline"
                        className="mb-6 gap-1.5 px-3 py-1 text-sm font-medium"
                    >
                        <RiHeartPulseLine className="size-3.5 text-primary" />
                        {hero.eyebrow}
                    </Badge>

                    <h1 className="font-heading text-4xl font-bold tracking-tight @5xl:text-6xl">
                        {hero.headline}{" "}
                        <span className="text-primary">{hero.accent}</span>
                    </h1>

                    <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                        {hero.description}
                    </p>

                    <HeroSearchForm
                        lang={lang}
                        labels={dictionary.common}
                        submitLabel={hero.findDonors}
                        locations={locations}
                    />

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                        <Button asChild className="gap-1">
                            <Link href={`/${lang}/register`} id="hero-register">
                                {hero.donorCta}
                                <RiArrowRightSLine className="size-4" />
                            </Link>
                        </Button>
                        <p className="max-w-md text-sm leading-6 text-muted-foreground">
                            {dictionary.common.safety}
                        </p>
                    </div>
                </div>

                <div className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
                    {hero.stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
                        >
                            <span className="text-sm text-muted-foreground">
                                {stat.label}
                            </span>
                            <span className="font-heading text-2xl font-bold text-primary">
                                {stat.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
