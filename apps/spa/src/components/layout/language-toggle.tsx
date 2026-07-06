import { useLocation, useNavigate } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import { isLocale, type Locale } from "@/lib/i18n/config"
import { usePreferencesStore } from "@/stores/preferences-store"

export function LanguageToggle({ label }: { label: string }) {
    const location = useLocation()
    const navigate = useNavigate()
    const setLocale = usePreferencesStore((state) => state.setLocale)

    const switchLanguage = () => {
        const parts = location.pathname.split("/")
        const currentLocale = parts[1] ?? ""
        const nextLocale: Locale = currentLocale === "bn" ? "en" : "bn"

        if (isLocale(currentLocale)) {
            parts[1] = nextLocale
        } else {
            parts.splice(1, 0, nextLocale)
        }

        const nextPath = `${parts.join("/")}${location.search}`

        document.cookie = `rakto-setu.locale=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`
        setLocale(nextLocale)
        navigate(nextPath)
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
