import { RiLoginCircleLine } from "@remixicon/react"
import { Section } from "@workspace/ui/components/section"
import { LoginForm } from "@/app/[lang]/login/_client/login-form"
import { getDictionary } from "@/lib/i18n/dictionaries"
import type { Locale } from "@/lib/i18n/config"

interface LoginPageProps {
    params: Promise<{ lang: Locale }>
}

export default async function LoginPage({ params }: LoginPageProps) {
    const { lang } = await params
    const dictionary = getDictionary(lang)

    return (
        <Section
            eyebrow={{ icon: <RiLoginCircleLine />, text: dictionary.nav.login }}
            title={dictionary.auth.loginTitle}
            description={dictionary.auth.loginDescription}
        >
            <LoginForm
                lang={lang}
                labels={{
                    phone: dictionary.auth.phone,
                    password: dictionary.auth.password,
                    submit: dictionary.auth.submitLogin,
                    register: dictionary.nav.register,
                }}
            />
        </Section>
    )
}
