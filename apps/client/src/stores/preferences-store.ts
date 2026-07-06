import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Locale } from "@/lib/i18n/config"

interface PreferencesState {
    locale: Locale
    setLocale: (locale: Locale) => void
}

export const usePreferencesStore = create<PreferencesState>()(
    persist(
        (set) => ({
            locale: "en",
            setLocale: (locale) => set({ locale }),
        }),
        { name: "rakto-setu.preferences" }
    )
)
