import { RiClipboardLine, RiHandHeartLine, RiCheckDoubleLine } from "@remixicon/react"

import type { T } from "@workspace/i18n"
import { Container } from "@/components/container"
import { Section } from "@/components/section"

interface HowItWorksProps {
    t: T["home"]["howItWorks"]
}

const steps = [
    { icon: RiClipboardLine },
    { icon: RiHandHeartLine },
    { icon: RiCheckDoubleLine },
] as const

export function HowItWorks({ t }: HowItWorksProps) {
    const titles = [t.step1Title, t.step2Title, t.step3Title]
    const descs = [t.step1Desc, t.step2Desc, t.step3Desc]

    return (
        <Section eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} align="center">
            <div className="grid gap-6 @2xl:grid-cols-3">
                {steps.map((s, i) => {
                    const Icon = s.icon
                    return (
                        <div
                            key={i}
                            className="relative flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center"
                        >
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-primary-foreground tabular-nums">
                                {i + 1}
                            </span>
                            <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Icon className="size-6" aria-hidden="true" />
                            </span>
                            <h3 className="text-lg font-semibold text-foreground">{titles[i]}</h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">{descs[i]}</p>
                        </div>
                    )
                })}
            </div>
        </Section>
    )
}
