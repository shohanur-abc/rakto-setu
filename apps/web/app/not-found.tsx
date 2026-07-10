import Link from "next/link"

import { getTranslation, defaultLocale } from "@workspace/i18n"
import { Button } from "@workspace/ui/components/button"
import { Container } from "@/components/container"

export default function NotFound() {
    const t = getTranslation(defaultLocale)
    return (
        <Container className="flex min-h-[70vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center">
                <p className="text-6xl font-bold text-primary">404</p>
                <h1 className="text-2xl font-bold text-foreground">{t.notFound.title}</h1>
                <p className="max-w-sm text-sm text-muted-foreground">{t.notFound.desc}</p>
                <Button asChild>
                    <Link href={`/${defaultLocale}`}>{t.notFound.home}</Link>
                </Button>
            </div>
        </Container>
    )
}
