import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { RiSaveLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import {
    Field,
    FieldDescription,
    FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { PageHeader } from "@/components/page-header"
import { DataState } from "@/components/data-state"
import { Spinner } from "@/components/spinner"
import {
    useAdminSettings,
    useUpdateSettings,
} from "@/lib/api/hooks/use-admin"
import { toErrorMessage } from "@/lib/api/error"
import { useI18n } from "@/lib/i18n/context"

export function AdminSettingsPage() {
    const { dictionary } = useI18n()
    const t = dictionary.app.admin
    const query = useAdminSettings()
    const update = useUpdateSettings()
    const settings = query.data

    const [cooldown, setCooldown] = useState<string>("")

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        try {
            await update.mutateAsync({
                donorCooldownDays: cooldown
                    ? Number(cooldown)
                    : settings?.donorCooldownDays,
            })
            toast.success(t.settingsSaved)
        } catch (error) {
            toast.error(toErrorMessage(error))
        }
    }

    return (
        <>
            <PageHeader title={t.settingsTitle} description={t.settingsDesc} />
            <DataState
                isLoading={query.isLoading}
                isError={query.isError}
                onRetry={() => query.refetch()}
            >
                {settings && (
                    <Card className="max-w-lg rounded-lg">
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-5 p-6">
                                <Field>
                                    <FieldLabel htmlFor="cooldown">
                                        {t.cooldownDays}
                                    </FieldLabel>
                                    <Input
                                        id="cooldown"
                                        type="number"
                                        min={30}
                                        max={180}
                                        defaultValue={settings.donorCooldownDays}
                                        onChange={(event) =>
                                            setCooldown(event.target.value)
                                        }
                                    />
                                    <FieldDescription>
                                        30–180
                                    </FieldDescription>
                                </Field>
                                <Button
                                    type="submit"
                                    className="gap-2"
                                    disabled={update.isPending}
                                >
                                    {update.isPending ? (
                                        <Spinner />
                                    ) : (
                                        <RiSaveLine className="size-4" />
                                    )}
                                    {dictionary.app.actions.save}
                                </Button>
                            </CardContent>
                        </form>
                    </Card>
                )}
            </DataState>
        </>
    )
}
