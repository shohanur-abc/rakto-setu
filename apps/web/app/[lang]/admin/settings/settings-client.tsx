"use client"

import { RiTimerLine } from "@remixicon/react"
import { useQueryClient } from "@tanstack/react-query"
import {
    getAdminGetSettingsQueryKey,
    useAdminGetSettings,
    useAdminUpdateSettings,
} from "api-client/src/admin"
import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { ErrorState, FieldList, LoadingRows, SubmitButton, TextField, formNumber } from "@/components/api-surface"
import { AdminTabs } from "../admin-tabs"

export function AdminSettingsClient({ lang }: { lang: string }) {
    const queryClient = useQueryClient()
    const settings = useAdminGetSettings()
    const updateSettings = useAdminUpdateSettings({
        mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getAdminGetSettingsQueryKey() }) },
    })

    return (
        <>
            <PageHeader eyebrow="Admin" title="Settings" subtitle="Tune operational rules that affect donor eligibility and platform behavior." />
            <AdminTabs lang={lang} />
            <Container className="grid gap-6 py-8 @2xl:py-10 @6xl:grid-cols-[minmax(0,1fr)_380px]">
                <section>
                    <div className="mb-3">
                        <h2 className="text-lg font-semibold text-foreground">Current configuration</h2>
                        <p className="text-sm text-muted-foreground">These values are used by donor eligibility and cooldown checks.</p>
                    </div>
                    {settings.error ? <ErrorState error={settings.error} /> : settings.isLoading ? <LoadingRows rows={2} /> : settings.data && (
                        <div className="space-y-4">
                            <div className="rounded-lg border border-border bg-card p-5">
                                <div className="flex items-center gap-3">
                                    <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <RiTimerLine className="size-5" aria-hidden="true" />
                                    </span>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Donor cooldown</p>
                                        <p className="text-3xl font-semibold tabular-nums text-foreground">{settings.data.donorCooldownDays} days</p>
                                    </div>
                                </div>
                            </div>
                            <FieldList items={[["Metadata", settings.data.metadata ? JSON.stringify(settings.data.metadata) : "No metadata"]]} />
                        </div>
                    )}
                </section>
                <form
                    className="h-fit space-y-3 rounded-lg border border-border bg-card p-5"
                    onSubmit={(event) => {
                        event.preventDefault()
                        updateSettings.mutate({ data: { donorCooldownDays: formNumber(event.currentTarget, "donorCooldownDays") ?? settings.data?.donorCooldownDays ?? 90, metadata: {} } })
                    }}
                >
                    <h2 className="text-lg font-semibold text-foreground">Update cooldown</h2>
                    <p className="text-sm text-muted-foreground">Use a value between 30 and 180 days. The default operating range is usually 90-120 days.</p>
                    <TextField name="donorCooldownDays" label="Donor cooldown days" type="number" defaultValue={settings.data?.donorCooldownDays ?? 90} />
                    <SubmitButton pending={updateSettings.isPending}>Save settings</SubmitButton>
                    {updateSettings.error && <ErrorState error={updateSettings.error} />}
                </form>
            </Container>
        </>
    )
}
