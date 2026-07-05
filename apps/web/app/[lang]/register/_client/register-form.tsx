"use client"

import Link from "next/link"
import { useActionState, useState } from "react"
import { RiLoader4Line, RiUserAddLine } from "@remixicon/react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardFooter } from "@workspace/ui/components/card"
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import {
    registerAction,
    type AuthActionState,
} from "@/lib/actions/auth"
import type { LocationViewDto } from "@/lib/api/generated/rakto-setu"
import type { Locale } from "@/lib/i18n/config"
import { bloodGroupValues } from "@/lib/url/options"

const emptyValue = "__none"
const initialState: AuthActionState = { ok: false, message: "" }

interface RegisterFormProps {
    lang: Locale
    locations: LocationViewDto[]
    labels: {
        fullName: string
        phone: string
        email: string
        password: string
        bloodGroup: string
        location: string
        select: string
        submit: string
        login: string
    }
}

export function RegisterForm({ lang, labels, locations }: RegisterFormProps) {
    const [bloodGroup, setBloodGroup] = useState(emptyValue)
    const [locationId, setLocationId] = useState(emptyValue)
    const [state, formAction, isPending] = useActionState(
        registerAction,
        initialState
    )

    return (
        <Card className="mx-auto w-full max-w-2xl rounded-lg text-left">
            <form action={formAction}>
                <input type="hidden" name="preferredLanguage" value={lang} />
                <input
                    type="hidden"
                    name="bloodGroup"
                    value={bloodGroup === emptyValue ? "" : bloodGroup}
                />
                <input
                    type="hidden"
                    name="locationId"
                    value={locationId === emptyValue ? "" : locationId}
                />

                <CardContent className="p-6">
                    <FieldGroup>
                        <div className="grid gap-4 @2xl:grid-cols-2">
                            <Field>
                                <FieldLabel htmlFor="register-full-name">
                                    {labels.fullName}
                                </FieldLabel>
                                <Input
                                    id="register-full-name"
                                    name="fullName"
                                    autoComplete="name"
                                    required
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="register-phone">
                                    {labels.phone}
                                </FieldLabel>
                                <Input
                                    id="register-phone"
                                    name="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    required
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="register-email">
                                    {labels.email}
                                </FieldLabel>
                                <Input
                                    id="register-email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="register-password">
                                    {labels.password}
                                </FieldLabel>
                                <Input
                                    id="register-password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    minLength={8}
                                    required
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="register-blood-group">
                                    {labels.bloodGroup}
                                </FieldLabel>
                                <Select
                                    value={bloodGroup}
                                    onValueChange={setBloodGroup}
                                >
                                    <SelectTrigger
                                        id="register-blood-group"
                                        className="w-full"
                                    >
                                        <SelectValue
                                            placeholder={labels.select}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={emptyValue}>
                                            {labels.select}
                                        </SelectItem>
                                        {bloodGroupValues.map((group) => (
                                            <SelectItem
                                                key={group}
                                                value={group}
                                            >
                                                {group}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="register-location">
                                    {labels.location}
                                </FieldLabel>
                                <Select
                                    value={locationId}
                                    onValueChange={setLocationId}
                                >
                                    <SelectTrigger
                                        id="register-location"
                                        className="w-full"
                                    >
                                        <SelectValue
                                            placeholder={labels.select}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={emptyValue}>
                                            {labels.select}
                                        </SelectItem>
                                        {locations.map((location) => (
                                            <SelectItem
                                                key={location.id}
                                                value={location.id}
                                            >
                                                {location.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                        </div>

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
                        id="register-submit"
                        type="submit"
                        className="w-full gap-2"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <RiLoader4Line className="size-4 animate-spin" />
                        ) : (
                            <RiUserAddLine className="size-4" />
                        )}
                        {labels.submit}
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href={`/${lang}/login`}>{labels.login}</Link>
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
