import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
    NativeSelect,
    NativeSelectOption,
} from "@workspace/ui/components/native-select"
import { Textarea } from "@workspace/ui/components/textarea"
import { bloodGroupValues, urgencyValues } from "@/lib/url/options"

export function TextField({
    id,
    name,
    label,
    type = "text",
    defaultValue,
    required,
    min,
}: {
    id: string
    name: string
    label: string
    type?: string
    defaultValue?: string | number | null
    required?: boolean
    min?: string | number
}) {
    return (
        <Field>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <Input
                id={id}
                name={name}
                type={type}
                defaultValue={defaultValue ?? undefined}
                required={required}
                min={min}
            />
        </Field>
    )
}

export function TextAreaField({
    id,
    name,
    label,
    defaultValue,
}: {
    id: string
    name: string
    label: string
    defaultValue?: string | null
}) {
    return (
        <Field>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <Textarea id={id} name={name} defaultValue={defaultValue ?? ""} />
        </Field>
    )
}

export function SelectField({
    id,
    name,
    label,
    defaultValue,
    children,
    required,
}: {
    id: string
    name: string
    label: string
    defaultValue?: string | null
    children: React.ReactNode
    required?: boolean
}) {
    return (
        <Field>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <NativeSelect
                id={id}
                name={name}
                defaultValue={defaultValue ?? ""}
                className="w-full"
                required={required}
            >
                {children}
            </NativeSelect>
        </Field>
    )
}

export function BloodGroupOptions({ empty = true }: { empty?: boolean }) {
    return (
        <>
            {empty && <NativeSelectOption value="">Select</NativeSelectOption>}
            {bloodGroupValues.map((group) => (
                <NativeSelectOption key={group} value={group}>
                    {group}
                </NativeSelectOption>
            ))}
        </>
    )
}

export function UrgencyOptions({ empty = true }: { empty?: boolean }) {
    return (
        <>
            {empty && <NativeSelectOption value="">Select</NativeSelectOption>}
            {urgencyValues.map((urgency) => (
                <NativeSelectOption key={urgency} value={urgency}>
                    {urgency}
                </NativeSelectOption>
            ))}
        </>
    )
}

export { FieldGroup, NativeSelectOption }
