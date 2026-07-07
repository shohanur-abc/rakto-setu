export const locales = ["en", "bn"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "en"

export const isLocale = (value: string): value is Locale =>
    locales.includes(value as Locale)
