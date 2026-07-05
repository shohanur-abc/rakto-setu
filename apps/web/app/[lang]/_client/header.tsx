"use client"

import Link from "next/link"
import { Suspense, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
    RiDashboardLine,
    RiLogoutBoxLine,
    RiMenu3Line,
    RiUser3Line,
} from "@remixicon/react"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from "@workspace/ui/components/sheet"
import { logoutAction } from "@/lib/actions/auth"
import { useAuth } from "@/hooks/use-auth"
import type { Locale } from "@/lib/i18n/config"
import { LanguageToggle } from "@/app/[lang]/_client/language-toggle"

interface HeaderClientProps {
    children: React.ReactNode
    lang: Locale
    navLinks: { href: string; label: string }[]
    labels: {
        login: string
        register: string
        dashboard: string
        profile: string
        logout: string
        menu: string
        language: string
    }
}

export function HeaderClient({
    children,
    lang,
    navLinks,
    labels,
}: HeaderClientProps) {
    const { isAuthenticated, user, logout } = useAuth()
    const router = useRouter()
    const [sheetOpen, setSheetOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const initials = user?.fullName
        ? user.fullName
              .split(" ")
              .slice(0, 2)
              .map((name) => name[0])
              .join("")
              .toUpperCase()
        : "U"

    const handleLogout = () => {
        startTransition(async () => {
            const result = await logoutAction(lang)
            logout()
            router.push(result.redirectTo)
            router.refresh()
        })
    }

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 @2xl:px-6">
                {children}

                <nav className="hidden items-center gap-6 @5xl:flex">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            id={`nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <Suspense
                        fallback={
                            <Button variant="ghost" size="sm" disabled>
                                {labels.language}
                            </Button>
                        }
                    >
                        <LanguageToggle label={labels.language} />
                    </Suspense>

                    {isAuthenticated && user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    id="header-user-menu"
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full"
                                    aria-label="User menu"
                                >
                                    <Avatar className="size-8">
                                        <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                                <div className="px-2 py-1.5">
                                    <p className="text-sm font-medium">
                                        {user.fullName}
                                    </p>
                                    <p className="text-xs capitalize text-muted-foreground">
                                        {user.role}
                                    </p>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={`/${lang}/dashboard`}
                                        id="header-go-dashboard"
                                        className="flex items-center gap-2"
                                    >
                                        <RiDashboardLine className="size-4" />
                                        {labels.dashboard}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={`/${lang}/${user.role}/profile`}
                                        id="header-go-profile"
                                        className="flex items-center gap-2"
                                    >
                                        <RiUser3Line className="size-4" />
                                        {labels.profile}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    id="header-logout"
                                    onClick={handleLogout}
                                    disabled={isPending}
                                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                                >
                                    <RiLogoutBoxLine className="size-4" />
                                    {labels.logout}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="hidden @2xl:inline-flex"
                            >
                                <Link href={`/${lang}/login`} id="header-login">
                                    {labels.login}
                                </Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link
                                    href={`/${lang}/register`}
                                    id="header-register"
                                >
                                    {labels.register}
                                </Link>
                            </Button>
                        </>
                    )}

                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                        <SheetTrigger asChild>
                            <Button
                                id="header-mobile-menu"
                                variant="ghost"
                                size="icon"
                                className="@5xl:hidden"
                                aria-label={labels.menu}
                            >
                                <RiMenu3Line className="size-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-72">
                            <SheetTitle className="sr-only">
                                {labels.menu}
                            </SheetTitle>
                            <nav className="mt-8 flex flex-col gap-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        id={`mobile-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                                        onClick={() => setSheetOpen(false)}
                                        className="rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}
