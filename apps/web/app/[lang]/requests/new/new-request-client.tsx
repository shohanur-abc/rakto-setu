"use client"

import { RiSendPlaneLine, RiErrorWarningLine, RiLockLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { useState } from "react"
import { useRouter } from "next/navigation"

import type { Locale, T } from "@workspace/i18n"
import { useRequestsCreate } from "api-client/src/requests"
import { useLocationsList } from "api-client/src/locations"
import { useAuthStore } from "@/lib/auth-store"
import { BLOOD_GROUPS } from "@/components/blood-group-badge"
import { PageHeader } from "@/components/page-header"
import { Container } from "@/components/container"
import Link from "next/link"

const URGENCIES = ["routine", "urgent", "emergency"] as const

export function NewRequestClient({
    lang,
    t,
    urgency,
}: {
    lang: Locale
    t: T["requests"]
    urgency: T["urgency"]
    common: T["common"]
}) {
    const router = useRouter()
    const { token } = useAuthStore()

    const [form, setForm] = useState({
        patientName: "",
        patientAge: "",
        bloodGroup: "",
        locationId: "",
        unitsNeeded: "1",
        hospitalName: "",
        urgency: "routine",
        neededBy: "",
        notes: "",
    })

    const locationsQ = useLocationsList()
    const locations = locationsQ.data ?? []

    const create = useRequestsCreate({
        mutation: { onSuccess: () => router.push(`/${lang}/requests`) },
    })

    function set<K extends keyof typeof form>(key: K, value: string) {
        setForm((f) => ({ ...f, [key]: value }))
    }

    function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        create.mutate({
            data: {
                patientName: form.patientName,
                patientAge: form.patientAge ? Number(form.patientAge) : undefined,
                bloodGroup: form.bloodGroup as never,
                locationId: form.locationId,
                unitsNeeded: Number(form.unitsNeeded) || 1,
                hospitalName: form.hospitalName,
                urgency: form.urgency as never,
                neededBy: new Date(form.neededBy).toISOString(),
                notes: form.notes || undefined,
            },
        })
    }

    const err = create.error

    if (!token) {
        return (
            <>
                <PageHeader eyebrow={t.new.title} title={t.new.title} subtitle={t.new.subtitle} />
                <Container className="py-16">
                    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-xl border border-border bg-card p-8 text-center">
                        <RiLockLine className="size-10 text-primary" aria-hidden="true" />
                        <p className="text-sm text-muted-foreground">{t.new.loginRequired}</p>
                        <Button asChild>
                            <Link href={`/${lang}/login`}>{"Log in"}</Link>
                        </Button>
                    </div>
                </Container>
            </>
        )
    }

    return (
        <>
            <PageHeader eyebrow={t.new.title} title={t.new.title} subtitle={t.new.subtitle} />
            <Container className="py-10 @2xl:py-12">
                <form onSubmit={onSubmit} className="mx-auto grid max-w-2xl gap-4 rounded-xl border border-border bg-card p-6 @2xl:grid-cols-2">
                    <Field className="@2xl:col-span-2">
                        <Label htmlFor="patientName">{t.new.patientName}</Label>
                        <Input id="patientName" value={form.patientName} onChange={(e) => set("patientName", e.target.value)} required />
                    </Field>
                    <Field>
                        <Label htmlFor="patientAge">{t.new.patientAge}</Label>
                        <Input id="patientAge" type="number" min={0} max={120} value={form.patientAge} onChange={(e) => set("patientAge", e.target.value)} />
                    </Field>
                    <Field>
                        <Label htmlFor="unitsNeeded">{t.new.unitsNeeded}</Label>
                        <Input id="unitsNeeded" type="number" min={1} max={10} value={form.unitsNeeded} onChange={(e) => set("unitsNeeded", e.target.value)} required />
                    </Field>
                    <Field>
                        <Label>{t.new.bloodGroup}</Label>
                        <Select value={form.bloodGroup} onValueChange={(v) => set("bloodGroup", v)}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="—" /></SelectTrigger>
                            <SelectContent>
                                {BLOOD_GROUPS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field>
                        <Label>{t.new.urgency}</Label>
                        <Select value={form.urgency} onValueChange={(v) => set("urgency", v)}>
                            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {URGENCIES.map((u) => <SelectItem key={u} value={u}>{(urgency as Record<string, string>)[u]}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field className="@2xl:col-span-2">
                        <Label htmlFor="hospitalName">{t.new.hospitalName}</Label>
                        <Input id="hospitalName" value={form.hospitalName} onChange={(e) => set("hospitalName", e.target.value)} required />
                    </Field>
                    <Field>
                        <Label>{t.new.location}</Label>
                        <Select value={form.locationId} onValueChange={(v) => set("locationId", v)}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="—" /></SelectTrigger>
                            <SelectContent>
                                {locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field>
                        <Label htmlFor="neededBy">{t.new.neededBy}</Label>
                        <Input id="neededBy" type="datetime-local" value={form.neededBy} onChange={(e) => set("neededBy", e.target.value)} required />
                    </Field>
                    <Field className="@2xl:col-span-2">
                        <Label htmlFor="notes">{t.new.notes}</Label>
                        <Textarea id="notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder={t.new.notesHint} rows={3} />
                    </Field>
                    {err && (
                        <p className="@2xl:col-span-2 flex items-center gap-2 text-sm text-destructive">
                            <RiErrorWarningLine className="size-4 shrink-0" />
                            {err.messages?.[0] ?? "Error"}
                        </p>
                    )}
                    <div className="@2xl:col-span-2">
                        <Button type="submit" disabled={create.isPending} size="lg">
                            <RiSendPlaneLine className="size-4" aria-hidden="true" />
                            {t.new.submit}
                        </Button>
                    </div>
                </form>
            </Container>
        </>
    )
}

function Field({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>{children}</div>
}
