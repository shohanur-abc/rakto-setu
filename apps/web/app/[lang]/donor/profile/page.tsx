import Link from "next/link"
import { Suspense } from "react"
import { connection } from "next/server"
import { RiUserHeartLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardFooter } from "@workspace/ui/components/card"
import { Section } from "@workspace/ui/components/section"
import { AppStatCard } from "@/components/app-stat-card"
import {
    BloodGroupOptions,
    FieldGroup,
    SelectField,
    TextAreaField,
    TextField,
} from "@/components/form-fields"
import { PrivateNav } from "@/components/private-nav"
import {
    updateAvailabilityAction,
    updateDonorProfileAction,
} from "@/lib/actions/private"
import {
    getDonorEligibility,
    getDonorProfile,
    getPrivateProfile,
} from "@/lib/api/private-data"
import type { Locale } from "@/lib/i18n/config"

interface DonorProfilePageProps {
    params: Promise<{ lang: Locale }>
}

export default async function DonorProfilePage({
    params,
}: DonorProfilePageProps) {
    const { lang } = await params

    return (
        <Section
            eyebrow={{ icon: <RiUserHeartLine />, text: "Donor" }}
            title="Donor profile"
            description="Manage donor availability, eligibility, and profile review status."
            align="left"
        >
            <Suspense fallback={<div className="h-96 rounded-lg bg-muted" />}>
                <DonorProfileContent lang={lang} />
            </Suspense>
        </Section>
    )
}

async function DonorProfileContent({ lang }: { lang: Locale }) {
    await connection()
    const user = await getPrivateProfile(lang)
    const donorState = await getDonorState(lang)

    if (!donorState) {
        return (
            <div className="space-y-6">
                <PrivateNav lang={lang} role={user.role} />
                <Card className="max-w-2xl rounded-lg">
                    <CardContent className="space-y-4 p-6">
                        <h2 className="text-xl font-semibold">
                            No donor profile found
                        </h2>
                        <p className="text-sm leading-6 text-muted-foreground">
                            Register once to appear in internal donor matching
                            after admin review.
                        </p>
                        <Button asChild>
                            <Link href={`/${lang}/donor/register`}>
                                Register as donor
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const { profile, eligibility } = donorState

    return (
        <div className="space-y-8">
            <PrivateNav lang={lang} role={user.role} />
            <div className="grid gap-4 @2xl:grid-cols-4">
                <AppStatCard label="Verification" value={profile.verification} />
                <AppStatCard
                    label="Available"
                    value={profile.isAvailable ? "Yes" : "No"}
                />
                <AppStatCard
                    label="Eligible"
                    value={eligibility.eligible ? "Yes" : "No"}
                />
                <AppStatCard
                    label="Total donations"
                    value={profile.totalDonations}
                />
            </div>
            <div className="grid gap-6 @5xl:grid-cols-2">
                <Card className="rounded-lg">
                    <form action={updateDonorProfileAction.bind(null, lang)}>
                        <CardContent className="p-6">
                            <FieldGroup>
                                <SelectField
                                    id="bloodGroup"
                                    name="bloodGroup"
                                    label="Blood group"
                                    defaultValue={profile.bloodGroup}
                                >
                                    <BloodGroupOptions empty={false} />
                                </SelectField>
                                <TextField
                                    id="lastDonationDate"
                                    name="lastDonationDate"
                                    label="Last donation date"
                                    type="date"
                                    defaultValue={
                                        profile.lastDonationDate?.slice(0, 10) ??
                                        ""
                                    }
                                />
                                <TextAreaField
                                    id="notes"
                                    name="notes"
                                    label="Notes"
                                    defaultValue={profile.notes}
                                />
                            </FieldGroup>
                        </CardContent>
                        <CardFooter className="px-6 pb-6 pt-0">
                            <Button type="submit">Save donor profile</Button>
                        </CardFooter>
                    </form>
                </Card>
                <Card className="rounded-lg">
                    <CardContent className="space-y-5 p-6">
                        <div>
                            <h2 className="font-semibold">Availability</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Next eligible date:{" "}
                                {profile.nextEligibleDate?.slice(0, 10) ??
                                    "Available now"}
                            </p>
                        </div>
                        <form
                            action={updateAvailabilityAction.bind(null, lang)}
                            className="flex flex-wrap gap-3"
                        >
                            <input
                                type="hidden"
                                name="isAvailable"
                                value={profile.isAvailable ? "false" : "true"}
                            />
                            <Button type="submit">
                                {profile.isAvailable
                                    ? "Pause availability"
                                    : "Mark available"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

async function getDonorState(lang: Locale) {
    try {
        const [profile, eligibility] = await Promise.all([
            getDonorProfile(lang),
            getDonorEligibility(lang),
        ])

        return { profile, eligibility }
    } catch {
        return null
    }
}
