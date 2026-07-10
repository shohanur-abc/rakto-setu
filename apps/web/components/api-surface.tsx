"use client"

import { RiErrorWarningLine, RiInboxLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Textarea } from "@workspace/ui/components/textarea"

export function ApiSection({
    title,
    description,
    children,
}: {
    title: string
    description?: string
    children: React.ReactNode
}) {
    return (
        <section className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                {description && (
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                )}
            </div>
            {children}
        </section>
    )
}

export function ApiGrid({ children }: { children: React.ReactNode }) {
    return <div className="grid gap-4 @5xl:grid-cols-2">{children}</div>
}

export function ErrorState({
    error,
    fallback = "Something went wrong.",
}: {
    error: unknown
    fallback?: string
}) {
    const message =
        typeof error === "object" &&
        error &&
        "messages" in error &&
        Array.isArray((error as { messages?: unknown }).messages)
            ? String((error as { messages: unknown[] }).messages[0] ?? fallback)
            : fallback

    return (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive">
            <RiErrorWarningLine className="size-4 shrink-0" aria-hidden="true" />
            <span>{message}</span>
        </div>
    )
}

export function EmptyState({ children = "No records found." }: { children?: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            <RiInboxLine className="size-8" aria-hidden="true" />
            <p>{children}</p>
        </div>
    )
}

export function LoadingRows({ rows = 3 }: { rows?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: rows }).map((_, index) => (
                <Skeleton key={index} className="h-16 rounded-lg" />
            ))}
        </div>
    )
}

export function JsonPanel({ value }: { value: unknown }) {
    return (
        <pre className="max-h-80 overflow-auto rounded-lg bg-secondary p-3 text-xs leading-relaxed text-secondary-foreground">
            {JSON.stringify(value, null, 2)}
        </pre>
    )
}

export function FieldList({ items }: { items: Array<[string, React.ReactNode]> }) {
    return (
        <dl className="grid gap-3 text-sm @2xl:grid-cols-2">
            {items.map(([label, value]) => (
                <div key={label} className="rounded-lg bg-secondary/60 p-3">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-1 font-medium text-foreground">{value ?? "—"}</dd>
                </div>
            ))}
        </dl>
    )
}

export function TextField({
    name,
    label,
    type = "text",
    required,
    defaultValue,
    placeholder,
}: {
    name: string
    label: string
    type?: string
    required?: boolean
    defaultValue?: string | number
    placeholder?: string
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor={name}>{label}</Label>
            <Input
                id={name}
                name={name}
                type={type}
                required={required}
                defaultValue={defaultValue}
                placeholder={placeholder}
            />
        </div>
    )
}

export function TextAreaField({
    name,
    label,
    defaultValue,
}: {
    name: string
    label: string
    defaultValue?: string
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor={name}>{label}</Label>
            <Textarea id={name} name={name} defaultValue={defaultValue} />
        </div>
    )
}

export function SubmitButton({
    children,
    pending,
    variant = "default",
}: {
    children: React.ReactNode
    pending?: boolean
    variant?: React.ComponentProps<typeof Button>["variant"]
}) {
    return (
        <Button type="submit" disabled={pending} variant={variant}>
            {children}
        </Button>
    )
}

export function formValue(form: HTMLFormElement, name: string) {
    const value = new FormData(form).get(name)
    return typeof value === "string" && value.trim() ? value.trim() : undefined
}

export function formNumber(form: HTMLFormElement, name: string) {
    const value = formValue(form, name)
    return value ? Number(value) : undefined
}

export function formatDate(value: unknown, locale: string) {
    try {
        return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(value as string))
    } catch {
        return String(value ?? "—")
    }
}
