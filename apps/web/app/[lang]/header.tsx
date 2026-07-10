"use client"

import {
    RiHeartPulseLine,
    RiMenuLine,
    RiDashboardLine,
    RiSearch2Line,
    RiUserLine,
    RiNotification3Line,
} from "@remixicon/react"

import { Button } from "@workspace/ui/components/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@workspace/ui/components/sheet"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import type { Locale, T } from "@workspace/i18n"
import { useAuthStore } from "@/lib/auth-store"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"


interface NavItem {
    href: string
    label: string
}


interface HeaderProps {
    lang: Locale
    nav: T["nav"]
    theme: T["theme"]
    language: T["language"]
}


// ---------------- Main Header ----------------

export function Header({
    lang,
    nav,
    theme,
    language,
}: HeaderProps) {

    const pathname = usePathname()
    const { user } = useAuthStore()


    const items: NavItem[] = [
        { href: `/${lang}`, label: nav.home },
        { href: `/${lang}/donors`, label: nav.donors },
        { href: `/${lang}/requests`, label: nav.requests },
        { href: `/${lang}/info/faqs`, label: nav.info },
        { href: `/${lang}/announcements`, label: nav.announcements },
    ]


    const isActive = (href: string) =>
        href === `/${lang}`
            ? pathname === href
            : pathname.startsWith(href)

    const role = user?.role.toLocaleLowerCase() ?? null
    const dashboardHref = role ? `/${lang}/${role}` : null


    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex h-(--header-height) max-w-7xl items-center gap-3 px-4 @2xl:px-6 @5xl:px-8">

                <HeaderLogo
                    lang={lang}
                />
                <DesktopNav
                    items={items}
                    isActive={isActive}
                />
                <HeaderActions
                    lang={lang}
                    nav={nav}
                    theme={theme}
                    language={language}
                    dashboardHref={dashboardHref}
                />
                <MobileMenu
                    lang={lang}
                    items={items}
                    nav={nav}
                    isActive={isActive}
                />
            </div>
        </header>
    )
}


// ---------------- Logo ----------------

function HeaderLogo({ lang }: { lang: Locale }) {
    return (
        <Link
            href={`/${lang}`}
            className="flex items-center gap-2 font-bold text-foreground"
        >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <RiHeartPulseLine className="size-5" />
            </span>

            <span className="hidden text-lg tracking-tight @2xl:inline">
                RaktoSetu
            </span>
        </Link>
    )
}


// ---------------- Desktop Navigation ----------------

function DesktopNav({
    items,
    isActive,
}: {
    items: NavItem[]
    isActive: (href: string) => boolean
}) {
    return (
        <nav className="ml-4 hidden items-center gap-1 @2xl:flex">
            {items.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={
                        "rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
                        (isActive(item.href)
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground")
                    }
                >
                    {item.label}
                </Link>
            ))}
        </nav>
    )
}


// ---------------- Header Actions ----------------

function HeaderActions({
    lang,
    nav,
    theme,
    language,
    dashboardHref,
}: {
    lang: Locale
    nav: T["nav"]
    theme: T["theme"]
    language: T["language"]
    dashboardHref: string | null
}) {
    const { user } = useAuthStore()

    return (
        <div className="ml-auto flex items-center gap-1.5">

            <Button
                asChild
                variant="ghost"
                size="icon"
                className="hidden @2xl:inline-flex"
            >
                <Link href={`/${lang}/donors`}>
                    <RiSearch2Line className="size-4" />
                </Link>
            </Button>


            <LanguageSwitcher
                current={lang}
                label={language.label}
            />

            <ThemeToggle labels={theme} />


            {user ? (
                <>
                    {dashboardHref && (
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="hidden @2xl:inline-flex"
                        >
                            <Link href={dashboardHref}>
                                <RiDashboardLine className="size-4" />
                                {nav.dashboard}
                            </Link>
                        </Button>
                    )}

                    <Button asChild variant="ghost" size="icon">
                        <Link href={`/${lang}/notifications`}>
                            <RiNotification3Line className="size-4" />
                        </Link>
                    </Button>
                </>
            ) : (
                <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="hidden @2xl:inline-flex"
                >
                    <Link href={`/${lang}/login`}>
                        <RiUserLine className="size-4" />
                        {nav.login}
                    </Link>
                </Button>
            )}


            <Button
                asChild
                size="sm"
                className="hidden @2xl:inline-flex"
            >
                <Link href={`/${lang}/requests/new`}>
                    <RiHeartPulseLine className="size-4" />
                    {nav.requestBlood}
                </Link>
            </Button>

        </div>
    )
}


// ---------------- Mobile Menu ----------------

function MobileMenu({
    lang,
    items,
    nav,
    isActive,
}: {
    lang: Locale
    items: NavItem[]
    nav: T["nav"]
    isActive: (href: string) => boolean
}) {

    const [open, setOpen] = useState(false)
    const { user } = useAuthStore()


    return (
        <Sheet open={open} onOpenChange={setOpen}>

            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="@2xl:hidden"
                >
                    <RiMenuLine />
                </Button>
            </SheetTrigger>


            <SheetContent side="right" className="w-72">

                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <RiHeartPulseLine />
                        RaktoSetu
                    </SheetTitle>
                </SheetHeader>


                <nav
                    className="mt-4 flex flex-col gap-1"
                    onClick={() => setOpen(false)}
                >

                    {items.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={
                                "rounded-lg px-3 py-2.5 text-sm " +
                                (isActive(item.href)
                                    ? "bg-secondary"
                                    : "text-muted-foreground")
                            }
                        >
                            {item.label}
                        </Link>
                    ))}


                    <div className="my-2 h-px bg-border" />


                    {user ? (
                        <Link
                            href={`/${lang}/notifications`}
                            className="px-3 py-2.5"
                        >
                            Notifications
                        </Link>
                    ) : (
                        <Link
                            href={`/${lang}/login`}
                            className="px-3 py-2.5"
                        >
                            {nav.login}
                        </Link>
                    )}

                </nav>

            </SheetContent>

        </Sheet>
    )
}



