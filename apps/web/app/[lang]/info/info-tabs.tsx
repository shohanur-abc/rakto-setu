"use client"

import Link from "next/link"

import type { Locale, T } from "@workspace/i18n"

type TabKey = "faqs" | "compatibility" | "eligibility"

export function InfoTabs({
    lang,
    active,
    nav,
}: {
    lang: Locale
    active: TabKey
    nav: T["info"]["nav"]
}) {
    const tabs: { key: TabKey; href: string; label: string }[] = [
        { key: "faqs", href: `/${lang}/info/faqs`, label: nav.faqs },
        { key: "compatibility", href: `/${lang}/info/compatibility`, label: nav.compatibility },
        { key: "eligibility", href: `/${lang}/info/eligibility`, label: nav.eligibility },
    ]
    return (
        <div className="flex gap-1 border-b border-border">
            {tabs.map((tab) => (
                <Link
                    key={tab.key}
                    href={tab.href}
                    className={
                        "rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors " +
                        (active === tab.key
                            ? "border-b-2 border-primary text-foreground"
                            : "text-muted-foreground hover:text-foreground")
                    }
                >
                    {tab.label}
                </Link>
            ))}
        </div>
    )
}
