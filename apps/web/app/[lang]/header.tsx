import Link from "next/link"
import { RiHeartPulseLine } from "@remixicon/react"
import { HeaderClient } from "@/app/[lang]/_client/header"
import type { Dictionary } from "@/lib/i18n/dictionaries"
import type { Locale } from "@/lib/i18n/config"

export function Header({
    lang,
    dictionary,
}: {
    lang: Locale
    dictionary: Dictionary
}) {
    const navLinks = [
        { href: `/${lang}/search`, label: dictionary.nav.findBlood },
        {
            href: `/${lang}/requests/public`,
            label: dictionary.nav.activeRequests,
        },
        { href: `/${lang}/info`, label: dictionary.nav.learn },
    ]

    return (
        <HeaderClient
            lang={lang}
            navLinks={navLinks}
            labels={dictionary.nav}
        >
            <Link
                href={`/${lang}`}
                id="header-logo"
                className="flex items-center gap-2 font-heading text-xl font-bold text-foreground"
            >
                <RiHeartPulseLine className="size-6 text-primary" />
                <span>{dictionary.common.appName}</span>
            </Link>
        </HeaderClient>
    )
}
