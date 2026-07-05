"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { isLocale, type Locale } from "@/lib/i18n/config"
import { usePreferencesStore } from "@/lib/stores/preferences-store"

export function LanguageToggle({ label }: { label: string }) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const router = useRouter()
    const setLocale = usePreferencesStore((state) => state.setLocale)

    const switchLanguage = () => {
        const parts = pathname.split("/")
        const currentLocale = parts[1] ?? ""
        const nextLocale: Locale = currentLocale === "bn" ? "en" : "bn"

        if (isLocale(currentLocale)) {
            parts[1] = nextLocale
        } else {
            parts.splice(1, 0, nextLocale)
        }

        const query = searchParams.toString()
        const nextPath = `${parts.join("/")}${query ? `?${query}` : ""}`

        document.cookie = `rakto-setu.locale=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`
        setLocale(nextLocale)
        router.push(nextPath)
    }

    return (
        <Button
            id="language-toggle"
            variant="ghost"
            size="sm"
            onClick={switchLanguage}
        >
            {label}
        </Button>
    )
}
