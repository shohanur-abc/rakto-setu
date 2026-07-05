"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useActionState, useEffect } from "react"
import { RiLoader4Line, RiLoginCircleLine } from "@remixicon/react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardFooter } from "@workspace/ui/components/card"
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { loginAction, type AuthActionState } from "@/lib/actions/auth"
import { useAuth } from "@/hooks/use-auth"
import type { Locale } from "@/lib/i18n/config"

const initialState: AuthActionState = { ok: false, message: "" }

interface LoginFormProps {
    lang: Locale
    labels: {
        phone: string
        password: string
        submit: string
        register: string
    }
}

export function LoginForm({ lang, labels }: LoginFormProps) {
    const router = useRouter()
    const { login } = useAuth()
    const [state, formAction, isPending] = useActionState(
        loginAction,
        initialState
    )

    useEffect(() => {
        if (!state.ok || !state.user) return

        login(state.user)
        router.push(`/${lang}`)
        router.refresh()
    }, [lang, login, router, state])

    return (
        <Card className="mx-auto w-full max-w-md rounded-lg text-left">
            <form action={formAction}>
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

                        {state.message && (
                            <Alert
                                variant={state.ok ? "default" : "destructive"}
                                className="rounded-lg"
                            >
                                <AlertDescription>
                                    {state.message}
                                </AlertDescription>
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
                        {labels.submit}
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href={`/${lang}/register`}>
                            {labels.register}
                        </Link>
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
