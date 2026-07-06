import { Link } from "react-router-dom"
import {
    RiArrowRightSLine,
    RiCheckboxCircleLine,
    RiDropLine,
    RiHandHeartLine,
    RiHeartPulseLine,
    RiSearchEyeLine,
    RiUserAddLine,
} from "@remixicon/react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Section } from "@workspace/ui/components/section"
import { BloodGroupBadge } from "@/components/blood-group-badge"
import { HeroSearchForm } from "@/routes/home/hero-search-form"
import {
    useAvailabilitySummary,
    useCompatibility,
    useLocations,
} from "@/lib/api/public-data"
import { useI18n } from "@/lib/i18n/context"

const stepIcons = [
    RiUserAddLine,
    RiSearchEyeLine,
    RiHandHeartLine,
    RiCheckboxCircleLine,
]

export function HomePage() {
    const { dictionary, localePath } = useI18n()

    return (
        <>
            <Hero />
            <Availability />
            <HowItWorks />
            <BloodGroups />
        </>
    )

    function Hero() {
        const { data: locations = [] } = useLocations()
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
                            labels={dictionary.common}
                            submitLabel={hero.findDonors}
                            locations={locations}
                        />

                        <div className="mt-5 flex flex-wrap items-center gap-3">
                            <Button asChild className="gap-1">
                                <Link
                                    to={localePath("/register")}
                                    id="hero-register"
                                >
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

    function Availability() {
        const { data: summary = [] } = useAvailabilitySummary()
        const byGroup = Object.fromEntries(
            summary.map((item) => [item.bloodGroup, item.availableDonors])
        )

        return (
            <Section
                eyebrow={{
                    icon: <RiDropLine />,
                    text: dictionary.home.availability.eyebrow,
                }}
                title={dictionary.home.availability.title}
                description={dictionary.home.availability.description}
                cols={4}
            >
                {dictionary.bloodGroups.map((group) => (
                    <div
                        key={group}
                        className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 text-center"
                    >
                        <BloodGroupBadge bloodGroup={group} size="lg" />
                        <div>
                            <p className="font-heading text-3xl font-bold">
                                {byGroup[group] ?? 0}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {dictionary.home.availability.available}
                            </p>
                        </div>
                    </div>
                ))}
            </Section>
        )
    }

    function HowItWorks() {
        return (
            <Section
                eyebrow={{
                    icon: <RiHandHeartLine />,
                    text: dictionary.home.how.eyebrow,
                }}
                title={dictionary.home.how.title}
                description={dictionary.home.how.description}
                cols={4}
                className="bg-secondary/30"
            >
                {dictionary.home.how.steps.map((step, index) => {
                    const Icon = stepIcons[index] ?? RiHandHeartLine

                    return (
                        <Card key={step.step} className="rounded-lg bg-card/70">
                            <CardContent className="relative p-7">
                                <span className="absolute right-7 top-7 font-heading text-4xl font-bold text-muted/50">
                                    {step.step}
                                </span>
                                <span className="grid size-14 place-items-center rounded-full border bg-secondary">
                                    <Icon className="size-7 text-primary" />
                                </span>
                                <h3 className="mt-6 font-heading text-xl font-semibold">
                                    {step.title}
                                </h3>
                                <p className="mt-3 leading-7 text-muted-foreground">
                                    {step.description}
                                </p>
                            </CardContent>
                        </Card>
                    )
                })}
            </Section>
        )
    }

    function BloodGroups() {
        const { data: compatibility = {} } = useCompatibility()

        return (
            <Section
                eyebrow={{
                    icon: <RiDropLine />,
                    text: dictionary.home.compatibility.eyebrow,
                }}
                title={dictionary.home.compatibility.title}
                description={dictionary.home.compatibility.description}
                cols={4}
            >
                {Object.entries(compatibility).map(([donor, groups]) => (
                    <div
                        key={donor}
                        className="rounded-lg border border-border bg-card p-5"
                    >
                        <span className="inline-block rounded-md border border-border bg-secondary px-3 py-1.5 font-heading text-xl font-bold">
                            {donor}
                        </span>
                        <p className="mt-3 text-xs font-medium uppercase text-muted-foreground">
                            {dictionary.home.compatibility.canDonateTo}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {groups.map((group) => (
                                <span
                                    key={group}
                                    className="rounded-md border border-border bg-background px-2 py-0.5 text-xs font-semibold"
                                >
                                    {group}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </Section>
        )
    }
}
