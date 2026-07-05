import type { Metadata } from "next"
import type { CSSProperties } from "react"
import { notFound } from "next/navigation"
import "@workspace/ui/globals.css"
import { Providers } from "@/components/providers"
import { Footer } from "@/app/[lang]/footer"
import { Header } from "@/app/[lang]/header"
import { defaultLocale, isLocale, locales, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"
import { cn } from "@workspace/ui/lib/utils"

export const metadata: Metadata = {
    title: {
        template: "%s | RaktoSetu",
        default: "RaktoSetu — Community Blood Bank",
    },
    description:
        "Connect with local blood donors. RaktoSetu makes finding and donating blood faster and more trustworthy.",
}

const fontVariables = {
    "--font-sans":
        'Inter, "Noto Sans Bengali", "Noto Sans", system-ui, sans-serif',
    "--font-heading":
        '"Noto Sans", Inter, "Noto Sans Bengali", system-ui, sans-serif',
    "--font-mono":
        '"Geist Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace',
} as CSSProperties

export function generateStaticParams() {
    return locales.map((lang) => ({ lang }))
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params

    if (!isLocale(lang)) {
        notFound()
    }

    const dictionary = getDictionary(lang)

    return (
        <html
            lang={lang || defaultLocale}
            suppressHydrationWarning
            className={cn("antialiased", "font-sans")}
            style={fontVariables}
        >
            <body>
                <div className="@container isolate">
                    <Providers>
                        <Header lang={lang} dictionary={dictionary} />
                        <main>{children}</main>
                        <Footer lang={lang} dictionary={dictionary} />
                    </Providers>
                </div>
            </body>
        </html>
    )
}

export type LangPageProps = {
    params: Promise<{ lang: Locale }>
}
