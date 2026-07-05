import { Suspense } from "react"
import { connection } from "next/server"
import { RiUserAddLine } from "@remixicon/react"
import { Section } from "@workspace/ui/components/section"
import { RegisterForm } from "@/app/[lang]/register/_client/register-form"
import { getLocations } from "@/lib/api/public-data"
import { getDictionary } from "@/lib/i18n/dictionaries"
import type { Locale } from "@/lib/i18n/config"

interface RegisterPageProps {
    params: Promise<{ lang: Locale }>
}

export default async function RegisterPage({ params }: RegisterPageProps) {
    const { lang } = await params
    const dictionary = getDictionary(lang)

    return (
        <Section
            eyebrow={{
                icon: <RiUserAddLine />,
                text: dictionary.nav.register,
            }}
            title={dictionary.auth.registerTitle}
            description={dictionary.auth.registerDescription}
        >
            <Suspense fallback={<RegisterFallback />}>
                <RegisterContent lang={lang} dictionary={dictionary} />
            </Suspense>
        </Section>
    )
}

async function RegisterContent({
    lang,
    dictionary,
}: {
    lang: Locale
    dictionary: ReturnType<typeof getDictionary>
}) {
    await connection()

    const locations = await getLocations().catch(() => [])

    return (
        <RegisterForm
            lang={lang}
            locations={locations}
            labels={{
                fullName: dictionary.auth.fullName,
                phone: dictionary.auth.phone,
                email: dictionary.auth.email,
                password: dictionary.auth.password,
                bloodGroup: dictionary.common.bloodGroup,
                location: dictionary.common.location,
                select: dictionary.common.select,
                submit: dictionary.auth.submitRegister,
                login: dictionary.nav.login,
            }}
        />
    )
}

function RegisterFallback() {
    return (
        <div className="mx-auto w-full max-w-2xl rounded-lg border border-border bg-card p-6">
            <div className="grid gap-4 @2xl:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-14 rounded bg-muted" />
                ))}
            </div>
            <div className="mt-6 h-10 rounded bg-muted" />
        </div>
    )
}
