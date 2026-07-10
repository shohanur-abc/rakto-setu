"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Container } from "@/components/container"

export type DashboardTab = {
    href: string
    label: string
    icon?: React.ReactNode
}

export function DashboardTabs({
    lang,
    tabs,
    fallback,
}: {
    lang: string
    tabs: readonly DashboardTab[]
    fallback: string
}) {
    const pathname = usePathname()
    const active =
        [...tabs]
            .sort((a, b) => b.href.length - a.href.length)
            .find((tab) => pathname === `/${lang}${tab.href}` || pathname.startsWith(`/${lang}${tab.href}/`))
            ?.href ?? fallback

    return (
        <Container className="pt-6">
            <Tabs value={active} className="min-w-0">
                <div className="-mx-4 overflow-x-auto px-4 pb-1 @2xl:mx-0 @2xl:px-0 @2xl:pb-0 scrollbar-none">
                    <TabsList
                        className="h-auto min-w-max justify-start gap-1 rounded-none"
                        variant="line"
                    >
                        {tabs.map((tab) => (
                            <TabsTrigger
                                key={tab.href}
                                value={tab.href}
                                asChild
                                className="min-h-9 flex-none px-3 py-2 text-sm @2xl:px-3.5"
                            >
                                <Link href={`/${lang}${tab.href}`}>
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </Link>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>
            </Tabs>
        </Container>
    )
}
