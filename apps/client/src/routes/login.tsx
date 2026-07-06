import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { RiLoader4Line, RiLoginCircleLine } from "@remixicon/react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardFooter } from "@workspace/ui/components/card"
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Section } from "@workspace/ui/components/section"
import { authLogin } from "@/lib/api/generated/rakto-setu"
import { ApiError } from "@/lib/api/fetch-client"
import { unwrap } from "@/lib/api/unwrap"
import { useAuth } from "@/hooks/use-auth"
import { useI18n } from "@/lib/i18n/context"

export function LoginPage() {
    const { lang, dictionary, localePath } = useI18n()
    const { login } = useAuth()
    const navigate = useNavigate()
    const [error, setError] = useState<string | null>(null)
    const [isPending, setPending] = useState(false)

    const labels = dictionary.auth

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError(null)
        setPending(true)

        const formData = new FormData(event.currentTarget)

        try {
            const result = unwrap(
                await authLogin({
                    phone: String(formData.get("phone") ?? "").trim(),
                    password: String(formData.get("password") ?? ""),
                })
            )

            login(result.user, result.token)
            navigate(`/${lang}`)
        } catch (caught) {
            setError(
                caught instanceof ApiError || caught instanceof Error
                    ? caught.message
                    : "Something went wrong"
            )
        } finally {
            setPending(false)
        }
    }

    return (
        <Section
            eyebrow={{ icon: <RiLoginCircleLine />, text: dictionary.nav.login }}
            title={labels.loginTitle}
            description={labels.loginDescription}
        >
            <Card className="mx-auto w-full max-w-md rounded-lg text-left">
                <form onSubmit={handleSubmit}>
                    <CardContent className="p-6">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="login-phone">
                                    {labels.phone}
                                </FieldLabel>
                                <Input
                                    id="login-phone"
                                    name="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    required
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="login-password">
                                    {labels.password}
                                </FieldLabel>
                                <Input
                                    id="login-password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                />
                            </Field>

                            {error && (
                                <Alert
                                    variant="destructive"
                                    className="rounded-lg"
                                >
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                        </FieldGroup>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3 px-6 pb-6 pt-0">
                        <Button
                            id="login-submit"
                            type="submit"
                            className="w-full gap-2"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <RiLoader4Line className="size-4 animate-spin" />
                            ) : (
                                <RiLoginCircleLine className="size-4" />
                            )}
                            {labels.submitLogin}
                        </Button>
                        <Button variant="ghost" asChild>
                            <Link to={localePath("/register")}>
                                {dictionary.nav.register}
                            </Link>
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </Section>
    )
}
