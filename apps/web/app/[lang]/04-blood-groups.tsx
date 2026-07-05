import { RiDropLine } from "@remixicon/react"
import { Section } from "@workspace/ui/components/section"
import { getCompatibility } from "@/lib/api/public-data"
import type { Dictionary } from "@/lib/i18n/dictionaries"

export async function BloodGroups({ dictionary }: { dictionary: Dictionary }) {
    const compatibility = await getCompatibility().catch(() => ({} as Record<string, string[]>))

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
