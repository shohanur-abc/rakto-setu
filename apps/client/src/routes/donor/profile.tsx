import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { RiSaveLine } from "@remixicon/react"
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
import { PageHeader } from "@/components/page-header"
import { DataState } from "@/components/data-state"
import { Spinner } from "@/components/spinner"
import { VerificationBadge } from "@/components/status-badges"
import {
    useDonorProfile,
    useUpdateDonorProfile,
} from "@/lib/api/hooks/use-donor"
import { toErrorMessage } from "@/lib/api/error"
import { bloodGroupValues } from "@/lib/url/options"
import { useI18n } from "@/lib/i18n/context"
import { formatDate } from "@/lib/format"
import type { UpdateDonorProfileDtoBloodGroup } from "@/lib/api/generated/rakto-setu"
import type { DonorProfile } from "@/routes/donor/types"

export function DonorProfilePage() {
    const { dictionary } = useI18n()
    const t = dictionary.app.donor
    const f = dictionary.app.fields
    const query = useDonorProfile()
    const update = useUpdateDonorProfile()
    const profile = query.data as unknown as DonorProfile | undefined

    const [bloodGroup, setBloodGroup] = useState<string>("")

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const form = new FormData(event.currentTarget)
        try {
            await update.mutateAsync({
                bloodGroup:
                    (bloodGroup as UpdateDonorProfileDtoBloodGroup) ||
                    (profile?.bloodGroup as UpdateDonorProfileDtoBloodGroup),
                lastDonationDate:
                    String(form.get("lastDonationDate") ?? "") || undefined,
                notes: String(form.get("notes") ?? "").trim() || undefined,
            })
            toast.success(t.profileUpdated)
        } catch (error) {
            toast.error(toErrorMessage(error))
        }
    }

    return (
        <>
            <PageHeader title={t.title} description={t.overviewDesc} />
            <DataState
                isLoading={query.isLoading}
                isError={query.isError}
                onRetry={() => query.refetch()}
            >
                {profile && (
                    <Card className="max-w-2xl rounded-lg">
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-5 p-6">
                                <div className="flex items-center justify-between rounded-md bg-muted/40 px-4 py-3">
                                    <span className="text-sm text-muted-foreground">
                                        {f.verification}
                                    </span>
                                    <VerificationBadge
                                        verification={profile.verification}
                                    />
                                </div>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel>{f.bloodGroup}</FieldLabel>
                                        <Select
                                            value={
                                                bloodGroup ||
                                                profile.bloodGroup
                                            }
                                            onValueChange={setBloodGroup}
                                        >
                                            <SelectTrigger
                                                aria-label={f.bloodGroup}
                                            >
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {bloodGroupValues.map(
                                                    (group) => (
                                                        <SelectItem
                                                            key={group}
                                                            value={group}
                                                        >
                                                            {group}
                                                        </SelectItem>
                                                    )
                                                )}
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
                                            defaultValue={
                                                profile.lastDonationDate?.slice(
                                                    0,
                                                    10
                                                ) ?? ""
                                            }
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="notes">
                                            {f.notes}
                                        </FieldLabel>
                                        <Textarea
                                            id="notes"
                                            name="notes"
                                            rows={3}
                                            defaultValue={profile.notes ?? ""}
                                        />
                                    </Field>
                                    {profile.nextEligibleDate && (
                                        <p className="text-sm text-muted-foreground">
                                            {t.nextEligible}:{" "}
                                            {formatDate(profile.nextEligibleDate)}
                                        </p>
                                    )}
                                    <Button
                                        type="submit"
                                        className="w-fit gap-2"
                                        disabled={update.isPending}
                                    >
                                        {update.isPending ? (
                                            <Spinner />
                                        ) : (
                                            <RiSaveLine className="size-4" />
                                        )}
                                        {dictionary.app.actions.save}
                                    </Button>
                                </FieldGroup>
                            </CardContent>
                        </form>
                    </Card>
                )}
            </DataState>
        </>
    )
}
