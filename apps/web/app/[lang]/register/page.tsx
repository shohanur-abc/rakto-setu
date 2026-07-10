import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getTranslation, isLocale } from "@workspace/i18n"
import { RegisterClient } from "./register-client"

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>
}): Promise<Metadata> {
    const { lang } = await params
    const t = getTranslation(lang)
    const canonicalLang = isLocale(lang) ? lang : "en"
    return {
        title: t.auth.register.meta.title,
        description: t.auth.register.meta.description,
        alternates: { canonical: `/${canonicalLang}/register` },
    }
}

export default async function RegisterPage({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    const t = getTranslation(lang)

    return <RegisterClient lang={lang} t={t.auth.register} common={t.common} />
}
