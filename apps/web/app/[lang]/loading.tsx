import { Card, CardContent } from "@workspace/ui/components/card"
import { Section } from "@workspace/ui/components/section"

export default function Loading() {
    return (
        <Section align="left" containerClass="space-y-4">
            <div className="max-w-2xl space-y-3">
                <div className="h-4 w-32 rounded bg-muted" />
                <div className="h-9 w-2/3 rounded bg-muted" />
                <div className="h-5 w-full rounded bg-muted" />
            </div>
            <div className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="rounded-lg">
                        <CardContent className="space-y-4 p-5">
                            <div className="h-5 w-24 rounded bg-muted" />
                            <div className="h-4 w-full rounded bg-muted" />
                            <div className="h-4 w-2/3 rounded bg-muted" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </Section>
    )
}
