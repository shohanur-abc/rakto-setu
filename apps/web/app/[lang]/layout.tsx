import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Inter, Lilita_One } from "next/font/google"

import { defaultLocale, getTranslation, isLocale, type Locale } from "@workspace/i18n"
import { Header } from "./header"
import { Footer } from "./footer"
import { LangSetter } from "./lang-setter"

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
    display: "swap",
})

const lilita = Lilita_One({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-heading",
    display: "swap",
})

export function generateStaticParams() {
    return [{ lang: "en" }, { lang: "bn" }]
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>
}): Promise<Metadata> {
    const { lang } = await params
    const locale = isLocale(lang) ? lang : defaultLocale
    const t = getTranslation(locale)
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

    return {
        metadataBase: new URL(siteUrl),
        title: {
            default: t.home.meta.title,
            template: `%s — ${t.common.appName}`,
        },
        description: t.home.meta.description,
        applicationName: t.common.appName,
        keywords: ["blood donation", "donor", "RaktoSetu", "Pabna", "Bangladesh", "রক্তদান", "রক্তসেতু"],
        authors: [{ name: "RaktoSetu" }],
        creator: "RaktoSetu",
        alternates: {
            canonical: `/${locale}`,
            languages: { en: "/en", bn: "/bn" },
        },
        openGraph: {
            type: "website",
            locale: locale === "bn" ? "bn_BD" : "en_US",
            url: siteUrl,
            siteName: t.common.appName,
            title: t.home.meta.title,
            description: t.home.meta.description,
        },
        twitter: {
            card: "summary_large_image",
            title: t.home.meta.title,
            description: t.home.meta.description,
        },
        robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
    }
}

export default async function LangLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    if (!isLocale(lang)) notFound()
    const locale: Locale = lang
    const t = getTranslation(locale)

    return (
        <div className={`${inter.variable} ${lilita.variable} @container flex min-h-screen flex-col`}>
            <LangSetter lang={locale} />
            <Header lang={locale} nav={t.nav} theme={t.theme} language={t.language} />
            <main className="flex-1">{children}</main>
            <Footer lang={locale} t={t.footer} nav={t.nav} info={t.info.nav} />
        </div>
    )
}
