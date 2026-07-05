import { Suspense } from "react"
import { connection } from "next/server"
import {
    RiBookOpenLine,
    RiCalendarCheckLine,
    RiMegaphoneLine,
} from "@remixicon/react"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@workspace/ui/components/accordion"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Section } from "@workspace/ui/components/section"
import { BloodGroupBadge } from "@/components/blood-group-badge"
import {
    getAnnouncements,
    getCompatibility,
    getEligibility,
    getFaqs,
} from "@/lib/api/public-data"
import { getDictionary } from "@/lib/i18n/dictionaries"
import type { Locale } from "@/lib/i18n/config"

interface InfoPageProps {
    params: Promise<{ lang: Locale }>
}

export default async function InfoPage({ params }: InfoPageProps) {
    const { lang } = await params
    const dictionary = getDictionary(lang)

    return (
        <Section
            eyebrow={{ icon: <RiBookOpenLine />, text: dictionary.nav.learn }}
            title={dictionary.info.title}
            description={dictionary.info.description}
            align="left"
        >
            <Suspense fallback={<InfoFallback />}>
                <InfoContent dictionary={dictionary} />
            </Suspense>
        </Section>
    )
}

async function InfoContent({
    dictionary,
}: {
    dictionary: ReturnType<typeof getDictionary>
}) {
    await connection()

    const [faqs, compatibility, eligibility, announcements] =
        await Promise.all([
            getFaqs(),
            getCompatibility(),
            getEligibility(),
            getAnnouncements(),
        ])

    return (
        <div className="space-y-10">
            <Alert className="rounded-lg">
                <AlertDescription>{dictionary.common.safety}</AlertDescription>
            </Alert>

            {announcements.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <RiMegaphoneLine className="size-5 text-primary" />
                        <h2 className="font-heading text-2xl font-semibold">
                            {dictionary.nav.learn}
                        </h2>
                    </div>
                    <div className="grid gap-4 @2xl:grid-cols-2">
                        {announcements.map((announcement) => (
                            <Card key={announcement.id} className="rounded-lg">
                                <CardContent className="p-5">
                                    <h3 className="font-semibold">
                                        {announcement.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        {announcement.body}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            <section id="eligibility" className="grid gap-4 @2xl:grid-cols-3">
                <EligibilityCard
                    label={dictionary.info.minimumAge}
                    value={`${eligibility.minimumAge}+`}
                />
                <EligibilityCard
                    label={dictionary.info.cooldown}
                    value={`${eligibility.generalCooldownDays} ${dictionary.info.days}`}
                />
                <Card className="rounded-lg @2xl:col-span-1">
                    <CardContent className="flex h-full items-start gap-3 p-5">
                        <RiCalendarCheckLine className="mt-0.5 size-5 shrink-0 text-primary" />
                        <p className="text-sm leading-6 text-muted-foreground">
                            {eligibility.note}
                        </p>
                    </CardContent>
                </Card>
            </section>

            <section id="compatibility" className="space-y-4">
                <h2 className="font-heading text-2xl font-semibold">
                    {dictionary.info.compatibility}
                </h2>
                <div className="grid gap-3 @2xl:grid-cols-2 @5xl:grid-cols-4">
                    {Object.entries(compatibility).map(
                        ([bloodGroup, canDonateTo]) => (
                            <Card key={bloodGroup} className="rounded-lg">
                                <CardContent className="space-y-3 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-sm text-muted-foreground">
                                            {
                                                dictionary.home.compatibility
                                                    .donor
                                            }
                                        </span>
                                        <BloodGroupBadge
                                            bloodGroup={bloodGroup}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {
                                            dictionary.home.compatibility
                                                .canDonateTo
                                        }
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {canDonateTo.map((group) => (
                                            <BloodGroupBadge
                                                key={group}
                                                bloodGroup={group}
                                                size="sm"
                                            />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    )}
                </div>
            </section>

            <section id="faqs" className="space-y-4">
                <h2 className="font-heading text-2xl font-semibold">
                    {dictionary.info.faqs}
                </h2>
                <Accordion type="single" collapsible>
                    {faqs.map((faq, index) => (
                        <AccordionItem
                            key={`${faq.question}-${index}`}
                            value={`faq-${index}`}
                        >
                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                            <AccordionContent>{faq.answer}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </section>
        </div>
    )
}

function InfoFallback() {
    return (
        <div className="space-y-6">
            <div className="h-16 rounded-lg bg-muted" />
            <div className="grid gap-4 @2xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-32 rounded-lg bg-muted" />
                ))}
            </div>
            <div className="grid gap-3 @2xl:grid-cols-2 @5xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="h-40 rounded-lg bg-muted" />
                ))}
            </div>
        </div>
    )
}

function EligibilityCard({ label, value }: { label: string; value: string }) {
    return (
        <Card className="rounded-lg">
            <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 font-heading text-3xl font-bold text-primary">
                    {value}
                </p>
            </CardContent>
        </Card>
    )
}
