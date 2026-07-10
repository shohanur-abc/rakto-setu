import { RiAddCircleLine, RiFileList3Line } from "@remixicon/react"
import { DashboardTabs } from "@/components/dashboard-tabs"

const recipientTabs = [
    { href: "/recipient/requests", label: "My requests", icon: <RiFileList3Line className="size-4" aria-hidden="true" /> },
    { href: "/recipient/requests/new", label: "Create request", icon: <RiAddCircleLine className="size-4" aria-hidden="true" /> },
] as const

export function RecipientTabs({ lang }: { lang: string }) {
    return <DashboardTabs lang={lang} tabs={recipientTabs} fallback="/recipient/requests" />
}
