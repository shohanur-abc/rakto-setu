import { Card, CardContent } from "@workspace/ui/components/card"

interface AppStatCardProps {
    label: string
    value: string | number
    hint?: string
    icon?: React.ReactNode
}

export function AppStatCard({ label, value, hint, icon }: AppStatCardProps) {
    return (
        <Card className="rounded-lg">
            <CardContent className="flex items-start justify-between gap-4 p-5">
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-2 font-heading text-3xl font-bold">
                        {value}
                    </p>
                    {hint && (
                        <p className="mt-1 text-xs text-muted-foreground">
                            {hint}
                        </p>
                    )}
                </div>
                {icon && (
                    <div className="rounded-lg border border-border bg-background p-2 text-primary [&_svg]:size-5">
                        {icon}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
