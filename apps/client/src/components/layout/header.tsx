import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
    RiDashboardLine,
    RiHeartPulseLine,
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
import { authLogout } from "@/lib/api/generated/rakto-setu"
import { useAuth } from "@/hooks/use-auth"
import { useI18n } from "@/lib/i18n/context"
import { LanguageToggle } from "@/components/layout/language-toggle"

export function Header() {
    const { lang, dictionary, localePath } = useI18n()
    const { isAuthenticated, user, logout } = useAuth()
    const navigate = useNavigate()
    const [sheetOpen, setSheetOpen] = useState(false)
    const [isPending, setPending] = useState(false)

    const labels = dictionary.nav
    const navLinks = [
        { href: localePath("/search"), label: dictionary.nav.findBlood },
        {
            href: localePath("/requests/public"),
            label: dictionary.nav.activeRequests,
        },
        { href: localePath("/info"), label: dictionary.nav.learn },
    ]

    const initials = user?.fullName
        ? user.fullName
              .split(" ")
              .slice(0, 2)
              .map((name) => name[0])
              .join("")
              .toUpperCase()
        : "U"

    const handleLogout = async () => {
        setPending(true)
        try {
            await authLogout({ allSessions: false })
        } catch {
            // Clearing local state is still the right recovery path.
        } finally {
            logout()
            setPending(false)
            navigate(`/${lang}`)
        }
    }

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 @2xl:px-6">
                <Link
                    to={`/${lang}`}
                    id="header-logo"
                    className="flex items-center gap-2 font-heading text-xl font-bold text-foreground"
                >
                    <RiHeartPulseLine className="size-6 text-primary" />
                    <span>{dictionary.common.appName}</span>
                </Link>

                <nav className="hidden items-center gap-6 @5xl:flex">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            to={link.href}
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <LanguageToggle label={labels.language} />

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
                                        to={localePath("/dashboard")}
                                        id="header-go-dashboard"
                                        className="flex items-center gap-2"
                                    >
                                        <RiDashboardLine className="size-4" />
                                        {labels.dashboard}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        to={localePath(`/${user.role}/profile`)}
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
                                <Link to={localePath("/login")} id="header-login">
                                    {labels.login}
                                </Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link
                                    to={localePath("/register")}
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
                                        to={link.href}
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
