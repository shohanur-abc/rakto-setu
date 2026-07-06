import { Link } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import { useI18n } from "@/lib/i18n/context"

export function NotFoundPage() {
    const { lang } = useI18n()

    return (
        <section className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-24 text-center">
            <p className="font-heading text-6xl font-bold text-primary">404</p>
            <h1 className="font-heading text-2xl font-semibold">
                Page not found
            </h1>
            <Button asChild>
                <Link to={`/${lang}`}>Go home</Link>
            </Button>
        </section>
    )
}
