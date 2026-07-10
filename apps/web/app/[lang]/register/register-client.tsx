"use client"

import { RiUserAddLine, RiErrorWarningLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import type { Locale, T } from "@workspace/i18n"
import { useAuthRegister } from "api-client/src/auth"
import { BLOOD_GROUPS } from "@/components/blood-group-badge"
import { Container } from "@/components/container"

export function RegisterClient({
    lang,
    t,
    common,
}: {
    lang: Locale
    t: T["auth"]["register"]
    common: T["common"]
}) {
    const router = useRouter()
    const [fullName, setFullName] = useState("")
    const [phone, setPhone] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [bloodGroup, setBloodGroup] = useState("")

    const register = useAuthRegister({
        mutation: { onSuccess: () => router.push(`/${lang}/login`) },
    })

    function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        register.mutate({
            data: {
                fullName,
                phone,
                email: email || undefined,
                password,
                bloodGroup: (bloodGroup || undefined) as never,
                preferredLanguage: lang,
            },
        })
    }

    const err = register.error

    return (
        <Container className="flex min-h-[70vh] items-center justify-center py-12">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
                </div>
                <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="fullName">{t.fullName}</Label>
                        <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="phone">{t.phone}</Label>
                        <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+8801XXXXXXXXX" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="email">{t.email}</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="password">{t.password}</Label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>{t.bloodGroup}</Label>
                        <Select value={bloodGroup} onValueChange={setBloodGroup}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={common.optional} />
                            </SelectTrigger>
                            <SelectContent>
                                {BLOOD_GROUPS.map((g) => (
                                    <SelectItem key={g} value={g}>
                                        {g}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {err && (
                        <p className="flex items-center gap-2 text-sm text-destructive">
                            <RiErrorWarningLine className="size-4 shrink-0" />
                            {err.messages?.[0] ?? t.error}
                        </p>
                    )}
                    <Button type="submit" disabled={register.isPending}>
                        <RiUserAddLine className="size-4" aria-hidden="true" />
                        {t.submit}
                    </Button>
                </form>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                    {t.hasAccount}{" "}
                    <Link href={`/${lang}/login`} className="font-medium text-primary hover:underline">
                        {t.login}
                    </Link>
                </p>
            </div>
        </Container>
    )
}
