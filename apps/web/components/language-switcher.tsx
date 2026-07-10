"use client"

import { RiGlobalLine, RiArrowDownSLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { usePathname, useRouter } from "next/navigation"
import { useTransition } from "react"

import type { Locale } from "@workspace/i18n"

const LOCALES: Locale[] = ["en", "bn"]
const LOCALE_LABELS: Record<Locale, string> = { en: "English", bn: "বাংলা" }

/**
 * Switches the `[lang]` segment of the current URL and persists the choice
 * via the `rakto-setu.locale` cookie (read by the proxy on next load).
 */
export function LanguageSwitcher({
    current,
    label,
}: {
    current: Locale
    label: string
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [pending, startTransition] = useTransition()

    function switchTo(next: Locale) {
        if (next === current) return
        const segments = pathname.split("/")
        // segments[0] === "" , segments[1] === current lang
        segments[1] = next
        document.cookie = `rakto-setu.locale=${next};path=/;max-age=${60 * 60 * 24 * 365}`
        startTransition(() => {
            router.push(segments.join("/") || "/")
            router.refresh()
        })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={pending} aria-label={label}>
                    <RiGlobalLine className="size-4" />
                    <span className="hidden @2xl:inline">{LOCALE_LABELS[current]}</span>
                    <RiArrowDownSLine className="size-3.5 opacity-60" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {LOCALES.map((l) => (
                    <DropdownMenuItem
                        key={l}
                        onClick={() => switchTo(l)}
                        className={l === current ? "font-semibold" : ""}
                    >
                        {LOCALE_LABELS[l]}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
