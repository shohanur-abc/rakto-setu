import { Card, CardContent } from "@workspace/ui/components/card"

export function AppEmpty({ children }: { children: React.ReactNode }) {
    return (
        <Card className="rounded-lg">
            <CardContent className="p-6 text-sm text-muted-foreground">
                {children}
            </CardContent>
        </Card>
    )
}
