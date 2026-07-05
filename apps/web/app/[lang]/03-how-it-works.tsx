import {
    RiCheckboxCircleLine,
    RiHandHeartLine,
    RiSearchEyeLine,
    RiUserAddLine,
} from "@remixicon/react"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Section } from "@workspace/ui/components/section"
import type { Dictionary } from "@/lib/i18n/dictionaries"

const stepIcons = [
    RiUserAddLine,
    RiSearchEyeLine,
    RiHandHeartLine,
    RiCheckboxCircleLine,
]

export function HowItWorks({ dictionary }: { dictionary: Dictionary }) {
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
