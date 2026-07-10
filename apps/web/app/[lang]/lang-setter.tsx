"use client"

import { useEffect } from "react"

import type { Locale } from "@workspace/i18n"

/**
 * Keeps <html lang> in sync with the active [lang] segment. The <html>
 * element lives in the root layout (which has no locale param), so this
 * tiny client component updates `document.documentElement.lang` after
 * hydration. It renders nothing.
 */
export function LangSetter({ lang }: { lang: Locale }) {
    useEffect(() => {
        document.documentElement.lang = lang
    }, [lang])
    return null
}
