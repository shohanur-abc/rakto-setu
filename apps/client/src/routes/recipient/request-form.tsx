import { useState, type FormEvent } from "react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import { Spinner } from "@/components/spinner"
import { useLocations } from "@/lib/api/public-data"
import { bloodGroupValues, urgencyValues } from "@/lib/url/options"
import { useI18n } from "@/lib/i18n/context"
import type { BloodRequestViewDto } from "@/lib/api/generated/rakto-setu"

export interface RequestFormValues {
    patientName: string
    patientAge?: number
    bloodGroup: string
    unitsNeeded?: number
    hospitalName: string
    locationId: string
    urgency: string
    neededBy: string
    notes?: string
}

interface RequestFormProps {
    /** Prefill for edit mode. */
    initial?: BloodRequestViewDto
    submitLabel: string
    pending: boolean
    onSubmit: (values: RequestFormValues) => void
}

// Shared create/edit form. Business logic (mutation, navigation, toasts) lives
// in the page; this only collects and validates the fields.
export function RequestForm({
    initial,
    submitLabel,
    pending,
    onSubmit,
}: RequestFormProps) {
    const { dictionary } = useI18n()
    const f = dictionary.app.fields
    const { data: locations = [] } = useLocations()

    const [bloodGroup, setBloodGroup] = useState(initial?.bloodGroup ?? "")
    const [locationId, setLocationId] = useState(initial?.locationId ?? "")
    const [urgency, setUrgency] = useState<string>(
        initial?.urgency ?? "urgent"
    )
    const [error, setError] = useState<string | null>(null)

    // Convert an ISO string to the value a datetime-local input expects.
    const toLocalInput = (iso?: string) => {
        if (!iso) return ""
        const date = new Date(iso)
        if (Number.isNaN(date.getTime())) return ""
        const pad = (n: number) => String(n).padStart(2, "0")
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
            date.getDate()
        )}T${pad(date.getHours())}:${pad(date.getMinutes())}`
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError(null)
        const form = new FormData(event.currentTarget)
        const patientName = String(form.get("patientName") ?? "").trim()
        const hospitalName = String(form.get("hospitalName") ?? "").trim()
        const neededByRaw = String(form.get("neededBy") ?? "")

        if (!patientName || !hospitalName || !bloodGroup || !locationId || !neededByRaw) {
            setError(dictionary.app.states.error)
            return
        }

        const ageRaw = String(form.get("patientAge") ?? "")
        const unitsRaw = String(form.get("unitsNeeded") ?? "")

        onSubmit({
            patientName,
            patientAge: ageRaw ? Number(ageRaw) : undefined,
            bloodGroup,
            unitsNeeded: unitsRaw ? Number(unitsRaw) : undefined,
            hospitalName,
            locationId,
            urgency,
            neededBy: new Date(neededByRaw).toISOString(),
            notes: String(form.get("notes") ?? "").trim() || undefined,
        })
    }

    return (
        <Card className="max-w-2xl rounded-lg">
            <form onSubmit={handleSubmit}>
                <CardContent className="p-6">
                    <FieldGroup>
                        <div className="grid gap-4 @2xl:grid-cols-2">
                            <Field>
                                <FieldLabel htmlFor="patientName">
                                    {f.patientName}
                                </FieldLabel>
                                <Input
                                    id="patientName"
                                    name="patientName"
                                    defaultValue={initial?.patientName}
                                    required
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="patientAge">
                                    {f.patientAge}
                                </FieldLabel>
                                <Input
                                    id="patientAge"
                                    name="patientAge"
                                    type="number"
                                    min={0}
                                    max={120}
                                    defaultValue={initial?.patientAge ?? ""}
                                />
                            </Field>
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
                                <FieldLabel htmlFor="unitsNeeded">
                                    {f.unitsNeeded}
                                </FieldLabel>
                                <Input
                                    id="unitsNeeded"
                                    name="unitsNeeded"
                                    type="number"
                                    min={1}
                                    max={10}
                                    defaultValue={initial?.unitsNeeded ?? 1}
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="hospitalName">
                                    {f.hospital}
                                </FieldLabel>
                                <Input
                                    id="hospitalName"
                                    name="hospitalName"
                                    defaultValue={initial?.hospitalName}
                                    required
                                />
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
                                <FieldLabel>{f.urgency}</FieldLabel>
                                <Select
                                    value={urgency}
                                    onValueChange={setUrgency}
                                >
                                    <SelectTrigger aria-label={f.urgency}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {urgencyValues.map((value) => (
                                            <SelectItem key={value} value={value}>
                                                {
                                                    dictionary.app.urgencyLevels[
                                                        value
                                                    ]
                                                }
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="neededBy">
                                    {f.neededBy}
                                </FieldLabel>
                                <Input
                                    id="neededBy"
                                    name="neededBy"
                                    type="datetime-local"
                                    defaultValue={toLocalInput(initial?.neededBy)}
                                    required
                                />
                            </Field>
                        </div>
                        <Field>
                            <FieldLabel htmlFor="notes">{f.notes}</FieldLabel>
                            <Textarea
                                id="notes"
                                name="notes"
                                rows={3}
                                defaultValue={initial?.notes ?? ""}
                            />
                        </Field>

                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}

                        <Button
                            type="submit"
                            className="w-fit gap-2"
                            disabled={pending}
                        >
                            {pending && <Spinner />}
                            {submitLabel}
                        </Button>
                    </FieldGroup>
                </CardContent>
            </form>
        </Card>
    )
}
