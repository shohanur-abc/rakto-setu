import { createContext, useContext, useMemo, type ReactNode } from "react"
import { useParams } from "react-router-dom"
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary, type Dictionary } from "@/lib/i18n/dictionaries"

interface I18nValue {
    lang: Locale
    dictionary: Dictionary
    /** Prefix an app path with the active locale, e.g. `/en/search`. */
    localePath: (path: string) => string
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
    const params = useParams<{ lang?: string }>()
    const lang: Locale = isLocale(params.lang ?? "")
        ? (params.lang as Locale)
        : defaultLocale

    const value = useMemo<I18nValue>(
        () => ({
            lang,
            dictionary: getDictionary(lang),
            localePath: (path) =>
                `/${lang}${path === "/" ? "" : path.startsWith("/") ? path : `/${path}`}`,
        }),
        [lang]
    )

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
    const value = useContext(I18nContext)

    if (!value) {
        throw new Error("useI18n must be used within an I18nProvider")
    }

    return value
}
