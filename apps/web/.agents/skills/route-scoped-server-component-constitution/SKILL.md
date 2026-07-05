---
name: route-scoped-server-component-constitution
description: Rules for structuring data-driven, composable Server Components — split into sub-components, typed interfaces, and a single data object
---

### Route-Scoped Server Component Constitution
Prefer structured, data-driven Server Components over monolithic, hardcoded components

1. **Composition Rule**
   - **Split:** Break large or logically distinct sections into small, self-contained sub-components
   - **Export:** Create and export ONE main component that assembles all sub-components in a single file
   - **Data:** Every sub-component receives its data exclusively via props — no internal hardcoding of content
   - **Section:** Always use the `Section` component from `@/components/ui/section` for any page section — Props: `title`, `eyebrow: { icon?, text }`, `description`, `align` (default: `"center"`), `cols` (`2|3|4` — auto-wraps children in responsive grid), `decorative`, `className`, `containerClass`, `classNames: { outerContainer, innerContainer, headingContainer, eyebrow, title, subtitle }`. Note: outer section = `@container isolate relative overflow-hidden`, inner = `max-w-7xl` centered padding already applied.

2. **Type Rule**
   - **Interface:** Define exactly ONE top-level interface for the entire component's data structure
   - **Nesting:** All sub-component prop types must be nested inside that ONE main interface — no separate top-level types
   - **Safety:** Do not use `any` — use precise types: `string`, `number`, `string[]`, Discriminated Unions, `RemixiconComponentType`, etc.

3. **Data Rule**
   - **Object:** Create a single `const data: MainInterfaceName = {...}` outside JSX — this contains ALL user-editable content: text, URLs, image src, labels, icons, config flags
   - **CMS Ready:** Structure must be flat and primitive-based — no functions, no JSX, no complex objects inside `data`. It must look like it came from a JSON API
   - **Zero Hardcoding:** Inside JSX, no hardcoded strings, URLs, or configuration values — everything must come from props, and props must come from the `data` object.


example:
```tsx
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Section } from "@/components/section"
import type { RemixiconComponentType } from "@remixicon/react"
import { RiCustomerService2Line, RiMapPin2Line, RiPriceTag3Line, RiSearchLine, RiShieldCheckLine, RiUserStarLine } from "@remixicon/react"

export const whyChooseData: WhyChooseProps = {
    eyebrow: "Built for Smarter Property Decisions",
    title: "Why Choose Smart Estate",
    description: "Everything you need to find, connect, and secure the right property with confidence and ease.",
    skyline: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1800&q=80",
    reasons: [
        {
            title: "Verified Listings",
            description: "Every property is carefully verified for authenticity, so you can browse and decide with total confidence.",
            icon: RiShieldCheckLine,
        },
        {
            title: "Trusted Agents",
            description: "Connect with experienced and background-checked agents who prioritize your best interests.",
            icon: RiUserStarLine,
        },
    //more
    ],
}

export function WhyChoose({ data = whyChooseData }: { data?: WhyChooseProps }) {
    return (
        <Section
            eyebrow={{ icon: <RiUserStarLine />, text: data.eyebrow }}
            title={data.title}
            description={data.description}
            cols={3}
        >
            {data.reasons.map((reason, index) => (
                <ReasonCard key={reason.title} reason={reason} index={index + 1} />
            ))}
        </Section>
    )
}

function ReasonCard({ reason, index }: { reason: WhyChooseProps["reasons"][0]; index: number }) {
    const Icon = reason.icon
    return (
        <Card className="rounded-xl bg-card/60 py-0">
            <CardContent className="relative p-7">
                <span className="absolute top-7 right-7 rounded-full border px-2 text-sm font-semibold text-primary">{String(index).padStart(2, "0")}</span>
                <span className="grid size-16 place-items-center rounded-full border bg-secondary">
                    <Icon className="size-8" />
                </span>
                <h3 className="mt-8 font-heading text-2xl font-semibold">{reason.title}</h3>
                <p className="mt-4 leading-7 text-muted-foreground">{reason.description}</p>
            </CardContent>
        </Card>
    )
}

export interface WhyChooseProps {
    eyebrow: string
    title: string
    description: string
    skyline: string
    reasons: {
        title: string
        description: string
        icon: RemixiconComponentType
    }[]
}

```
