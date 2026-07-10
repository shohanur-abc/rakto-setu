import { RiCalendarCheckLine, RiCheckboxCircleLine, RiHeartPulseLine, RiSearchEyeLine, RiUserHeartLine } from "@remixicon/react"
import { DashboardTabs } from "@/components/dashboard-tabs"

const donorTabs = [
    { href: "/donor", label: "Profile", icon: <RiUserHeartLine className="size-4" aria-hidden="true" /> },
    { href: "/donor/requests", label: "Matching requests", icon: <RiSearchEyeLine className="size-4" aria-hidden="true" /> },
    { href: "/donor/accepted", label: "Accepted", icon: <RiCheckboxCircleLine className="size-4" aria-hidden="true" /> },
    { href: "/donor/donations", label: "Donations", icon: <RiCalendarCheckLine className="size-4" aria-hidden="true" /> },
    { href: "/donor/eligibility", label: "Eligibility", icon: <RiHeartPulseLine className="size-4" aria-hidden="true" /> },
] as const

export function DonorTabs({ lang }: { lang: string }) {
    return <DashboardTabs lang={lang} tabs={donorTabs} fallback="/donor" />
}
