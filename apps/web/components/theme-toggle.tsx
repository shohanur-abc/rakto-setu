"use client"

import { RiMoonLine, RiSunLine, RiCheckboxCircleLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { useTheme } from "next-themes"

export function ThemeToggle({ labels }: { labels: { light: string; dark: string; system: string; toggle: string } }) {
    const { setTheme, theme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={labels.toggle}>
                    <RiSunLine className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <RiMoonLine className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                    <RiSunLine className="size-4" /> {labels.light}
                    {theme === "light" && <RiCheckboxCircleLine className="ml-auto size-4 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <RiMoonLine className="size-4" /> {labels.dark}
                    {theme === "dark" && <RiCheckboxCircleLine className="ml-auto size-4 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                    <RiCheckboxCircleLine className="size-4" /> {labels.system}
                    {theme === "system" && <RiCheckboxCircleLine className="ml-auto size-4 text-primary" />}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
