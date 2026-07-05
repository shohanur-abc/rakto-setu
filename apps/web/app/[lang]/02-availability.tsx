import { RiDropLine } from "@remixicon/react"
import { Section } from "@workspace/ui/components/section"
import { BloodGroupBadge } from "@/components/blood-group-badge"
import { getAvailabilitySummary } from "@/lib/api/public-data"
import type { Dictionary } from "@/lib/i18n/dictionaries"

export async function Availability({
    dictionary,
}: {
    dictionary: Dictionary
}) {
    const summary = await getAvailabilitySummary().catch(() => [])
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
