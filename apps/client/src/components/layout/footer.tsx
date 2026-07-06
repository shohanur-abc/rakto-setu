import { Link } from "react-router-dom"
import { RiHeartPulseLine } from "@remixicon/react"
import { Separator } from "@workspace/ui/components/separator"
import { useI18n } from "@/lib/i18n/context"

export function Footer() {
    const { lang, dictionary, localePath } = useI18n()
    const year = new Date().getFullYear()

    const footerLinks = [
        {
            heading: dictionary.footer.platform,
            items: [
                { label: dictionary.nav.findBlood, href: localePath("/search") },
                {
                    label: dictionary.nav.activeRequests,
                    href: localePath("/requests/public"),
                },
                { label: dictionary.nav.register, href: localePath("/register") },
            ],
        },
        {
            heading: dictionary.footer.information,
            items: [
                { label: dictionary.info.faqs, href: localePath("/info#faqs") },
                {
                    label: dictionary.info.eligibility,
                    href: localePath("/info#eligibility"),
                },
                {
                    label: dictionary.info.compatibility,
                    href: localePath("/info#compatibility"),
                },
            ],
        },
        {
            heading: dictionary.footer.account,
            items: [
                { label: dictionary.nav.login, href: localePath("/login") },
                { label: dictionary.nav.register, href: localePath("/register") },
                {
                    label: dictionary.nav.dashboard,
                    href: localePath("/dashboard"),
                },
            ],
        },
    ]

    return (
        <footer className="border-t border-border bg-card">
            <div className="mx-auto max-w-7xl px-4 py-12 @2xl:px-6">
                <div className="grid gap-8 @2xl:grid-cols-4">
                    <div>
                        <Link
                            to={`/${lang}`}
                            id="footer-logo"
                            className="inline-flex items-center gap-2 font-heading text-lg font-bold"
                        >
                            <RiHeartPulseLine className="size-5 text-primary" />
                            {dictionary.common.appName}
                        </Link>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            {dictionary.footer.tagline}
                        </p>
                    </div>

                    {footerLinks.map((section) => (
                        <div key={section.heading}>
                            <h3 className="mb-3 text-sm font-semibold">
                                {section.heading}
                            </h3>
                            <ul className="space-y-2">
                                {section.items.map((item) => (
                                    <li key={item.href}>
                                        <Link
                                            to={item.href}
                                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <Separator className="my-8" />

                <div className="flex flex-col gap-4 @2xl:flex-row @2xl:items-center @2xl:justify-between">
                    <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
                        {dictionary.common.safety}
                    </p>
                    <p className="shrink-0 text-xs text-muted-foreground">
                        © {year} {dictionary.common.appName}.{" "}
                        {dictionary.footer.rights}
                    </p>
                </div>
            </div>
        </footer>
    )
}
