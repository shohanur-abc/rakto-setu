import { notFound, redirect } from "next/navigation"

import { isLocale } from "@workspace/i18n"

export default async function InfoPage({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()

    redirect(`/${lang}/info/faqs`)
}
