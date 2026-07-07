import {
    RiDropLine,
    RiInformationLine,
    RiQuestionLine,
    RiUserHeartLine,
} from "@remixicon/react"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@workspace/ui/components/accordion"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Section } from "@workspace/ui/components/section"
import { DataState } from "@/components/data-state"
import {
    useCompatibility,
    useEligibility,
    useFaqs,
} from "@/lib/api/public-data"
import { useI18n } from "@/lib/i18n/context"

export function InfoPage() {
    const { dictionary } = useI18n()
    const info = dictionary.info

    return (
        <>
            <Section
                eyebrow={{ icon: <RiInformationLine />, text: dictionary.nav.learn }}
                title={info.title}
                description={info.description}
                classNames={{ innerContainer: "pb-8" }}
            />
            <Faqs />
            <Compatibility />
            <Eligibility />
        </>
    )

    function Faqs() {
        const query = useFaqs()
        const faqs = query.data ?? []
        return (
            <Section
                id="faqs"
                eyebrow={{ icon: <RiQuestionLine />, text: info.faqs }}
                title={info.faqs}
                align="left"
                className="bg-secondary/20"
            >
                <DataState
                    isLoading={query.isLoading}
                    isError={query.isError}
                    isEmpty={faqs.length === 0}
                    onRetry={() => query.refetch()}
                >
                    <Accordion
                        type="single"
                        collapsible
                        className="mx-auto max-w-3xl"
                    >
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`faq-${index}`}>
                                <AccordionTrigger className="text-left">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </DataState>
            </Section>
        )
    }

    function Compatibility() {
        const query = useCompatibility()
        const compatibility = query.data ?? {}
        return (
            <Section
                id="compatibility"
                eyebrow={{ icon: <RiDropLine />, text: info.compatibility }}
                title={info.compatibility}
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

    function Eligibility() {
        const query = useEligibility()
        const data = query.data
        return (
            <Section
                id="eligibility"
                eyebrow={{ icon: <RiUserHeartLine />, text: info.eligibility }}
                title={info.eligibility}
                className="bg-secondary/20"
            >
                <DataState
                    isLoading={query.isLoading}
                    isError={query.isError}
                    onRetry={() => query.refetch()}
                >
                    {data && (
                        <Card className="mx-auto max-w-2xl rounded-lg">
                            <CardContent className="grid gap-6 p-6 @2xl:grid-cols-2">
                                <Stat
                                    label={info.minimumAge}
                                    value={`${data.minimumAge}`}
                                />
                                <Stat
                                    label={info.cooldown}
                                    value={`${data.generalCooldownDays} ${info.days}`}
                                />
                                <p className="text-sm leading-relaxed text-muted-foreground @2xl:col-span-2">
                                    {data.note}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </DataState>
            </Section>
        )
    }
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-border bg-background p-4 text-center">
            <p className="font-heading text-3xl font-bold text-primary">
                {value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        </div>
    )
}
