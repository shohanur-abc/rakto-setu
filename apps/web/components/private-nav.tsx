import Link from "next/link"
import {
    RiAdminLine,
    RiHeartPulseLine,
    RiHome5Line,
    RiInboxLine,
    RiUserHeartLine,
    RiUserSettingsLine,
} from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import type { Locale } from "@/lib/i18n/config"

export function PrivateNav({
    lang,
    role,
}: {
    lang: Locale
    role?: string
}) {
    const links = [
        { href: `/${lang}/dashboard`, label: "Dashboard", icon: <RiHome5Line /> },
        { href: `/${lang}/requests`, label: "My requests", icon: <RiInboxLine /> },
        { href: `/${lang}/donor/profile`, label: "Donor", icon: <RiUserHeartLine /> },
        { href: `/${lang}/notifications`, label: "Notifications", icon: <RiHeartPulseLine /> },
        { href: `/${lang}/profile`, label: "Profile", icon: <RiUserSettingsLine /> },
        ...(role === "admin"
            ? [{ href: `/${lang}/admin`, label: "Admin", icon: <RiAdminLine /> }]
            : []),
    ]

    return (
        <nav className="flex flex-wrap gap-2">
            {links.map((link) => (
                <Button key={link.href} variant="outline" size="sm" asChild>
                    <Link href={link.href} className="gap-2">
                        <span className="[&_svg]:size-4">{link.icon}</span>
                        {link.label}
                    </Link>
                </Button>
            ))}
        </nav>
    )
}
