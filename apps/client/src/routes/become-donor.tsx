import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { RiHeartPulseLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import { Section } from "@workspace/ui/components/section"
import { Spinner } from "@/components/spinner"
import { useRegisterDonor } from "@/lib/api/hooks/use-donor"
import { useLocations } from "@/lib/api/public-data"
import { toErrorMessage } from "@/lib/api/error"
import { authMe } from "@/lib/api/generated/rakto-setu"
import { unwrap } from "@/lib/api/unwrap"
import { useAuth } from "@/hooks/use-auth"
import { useI18n } from "@/lib/i18n/context"
import { bloodGroupValues } from "@/lib/url/options"
import type { RegisterDonorDtoBloodGroup } from "@/lib/api/generated/rakto-setu"

export function BecomeDonorPage() {
    const { dictionary, localePath } = useI18n()
    const t = dictionary.app.donor
    const f = dictionary.app.fields
    const navigate = useNavigate()
    const { setUser, user } = useAuth()
    const register = useRegisterDonor()
    const { data: locations = [] } = useLocations()

    const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup ?? "")
    const [locationId, setLocationId] = useState(user?.locationId ?? "")

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!bloodGroup) {
            toast.error(f.bloodGroup)
            return
        }
        const form = new FormData(event.currentTarget)
        try {
            await register.mutateAsync({
                bloodGroup: bloodGroup as RegisterDonorDtoBloodGroup,
                locationId: locationId || undefined,
                lastDonationDate:
                    String(form.get("lastDonationDate") ?? "") || undefined,
                notes: String(form.get("notes") ?? "").trim() || undefined,
            })
            // Registering promotes the account to the donor role — refresh the
            // session user so the donor navigation appears immediately.
            const fresh = unwrap(await authMe())
            setUser(fresh)
            toast.success(t.registered)
            navigate(localePath("/donor"))
        } catch (error) {
            toast.error(toErrorMessage(error))
        }
    }

    return (
        <Section
            eyebrow={{ icon: <RiHeartPulseLine />, text: t.title }}
            title={t.registerTitle}
            description={t.registerDesc}
        >
            <Card className="mx-auto max-w-lg rounded-lg text-left">
                <form onSubmit={handleSubmit}>
                    <CardContent className="p-6">
                        <FieldGroup>
                            <Field>
                                <FieldLabel>{f.bloodGroup}</FieldLabel>
                                <Select
                                    value={bloodGroup || undefined}
                                    onValueChange={setBloodGroup}
                                >
                                    <SelectTrigger aria-label={f.bloodGroup}>
                                        <SelectValue
                                            placeholder={f.bloodGroup}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {bloodGroupValues.map((group) => (
                                            <SelectItem key={group} value={group}>
                                                {group}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field>
                                <FieldLabel>{f.area}</FieldLabel>
                                <Select
                                    value={locationId || undefined}
                                    onValueChange={setLocationId}
                                >
                                    <SelectTrigger aria-label={f.area}>
                                        <SelectValue placeholder={f.area} />
                                    </SelectTrigger>
                                    <SelectContent>
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
                            <Field>
                                <FieldLabel htmlFor="lastDonationDate">
                                    {f.lastDonation}
                                </FieldLabel>
                                <Input
                                    id="lastDonationDate"
                                    name="lastDonationDate"
                                    type="date"
                                />
                                <FieldDescription>{t.registerDesc}</FieldDescription>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="notes">{f.notes}</FieldLabel>
                                <Textarea id="notes" name="notes" rows={3} />
                            </Field>
                            <Button
                                type="submit"
                                className="gap-2"
                                disabled={register.isPending}
                            >
                                {register.isPending ? (
                                    <Spinner />
                                ) : (
                                    <RiHeartPulseLine className="size-4" />
                                )}
                                {t.registerTitle}
                            </Button>
                        </FieldGroup>
                    </CardContent>
                </form>
            </Card>
        </Section>
    )
}
