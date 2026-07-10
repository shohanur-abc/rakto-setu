"use client"

import { RiLoginCircleLine, RiErrorWarningLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import type { Locale, T } from "@workspace/i18n"
import { useAuthLogin } from "api-client/src/auth"
import { useAuthStore } from "@/lib/auth-store"
import { Container } from "@/components/container"

export function LoginClient({
    lang,
    t,
}: {
    lang: Locale
    t: T["auth"]["login"]
    common: T["common"]
}) {
    const router = useRouter()
    const setAuth = useAuthStore((s) => s.setAuth)
    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")

    const login = useAuthLogin({
        mutation: {
            onSuccess: (res) => {
                setAuth(res.token, res.user)
                router.push(`/${lang}`)
            },
        },
    })

    function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        login.mutate({ data: { phone, password } })
    }

    const err = login.error

    return (
        <Container className="flex min-h-[70vh] items-center justify-center py-12">
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
                </div>
                <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="phone">{t.phone}</Label>
                        <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+8801XXXXXXXXX" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="password">{t.password}</Label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    {err && (
                        <p className="flex items-center gap-2 text-sm text-destructive">
                            <RiErrorWarningLine className="size-4 shrink-0" />
                            {err.messages?.[0] ?? t.error}
                        </p>
                    )}
                    <Button type="submit" disabled={login.isPending}>
                        <RiLoginCircleLine className="size-4" aria-hidden="true" />
                        {t.submit}
                    </Button>
                </form>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                    {t.noAccount}{" "}
                    <Link href={`/${lang}/register`} className="font-medium text-primary hover:underline">
                        {t.register}
                    </Link>
                </p>
            </div>
        </Container>
    )
}
