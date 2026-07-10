import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getTranslation, isLocale } from "@workspace/i18n"
import { LoginClient } from "./login-client"

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>
}): Promise<Metadata> {
    const { lang } = await params
    const t = getTranslation(lang)
    const canonicalLang = isLocale(lang) ? lang : "en"
    return {
        title: t.auth.login.meta.title,
        description: t.auth.login.meta.description,
        alternates: { canonical: `/${canonicalLang}/login` },
    }
}

export default async function LoginPage({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    const t = getTranslation(lang)

    return <LoginClient lang={lang} t={t.auth.login} common={t.common} />
}
