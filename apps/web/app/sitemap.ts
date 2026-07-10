import type { MetadataRoute } from "next"

import { defaultLocale } from "@workspace/i18n"

const ROUTES = ["", "/donors", "/requests", "/info", "/info/faqs", "/info/compatibility", "/info/eligibility", "/announcements", "/login", "/register"]

export default function sitemap(): MetadataRoute.Sitemap {
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const now = new Date()
    return ROUTES.flatMap((route) =>
        ["en", "bn"].map((lang) => ({
            url: `${siteUrl}/${lang}${route}`,
            lastModified: now,
            changeFrequency: route === "" ? ("daily" as const) : ("weekly" as const),
            priority: route === "" ? 1 : 0.7,
        })),
    )
}
