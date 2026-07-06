import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { DataState } from "@/components/data-state"
import { RequestForm } from "@/routes/recipient/request-form"
import { useOwnRequest, useUpdateRequest } from "@/lib/api/hooks/use-requests"
import { toErrorMessage } from "@/lib/api/error"
import { useI18n } from "@/lib/i18n/context"
import type { UpdateBloodRequestDto } from "@/lib/api/generated/rakto-setu"

export function RequestEditPage() {
    const { id = "" } = useParams()
    const { dictionary, localePath } = useI18n()
    const t = dictionary.app.recipient
    const navigate = useNavigate()
    const query = useOwnRequest(id)
    const update = useUpdateRequest(id)

    return (
        <>
            <PageHeader title={t.editTitle} />
            <DataState
                isLoading={query.isLoading}
                isError={query.isError}
                onRetry={() => query.refetch()}
            >
                {query.data && (
                    <RequestForm
                        initial={query.data}
                        submitLabel={dictionary.app.actions.save}
                        pending={update.isPending}
                        onSubmit={async (values) => {
                            try {
                                // Only editable fields are sent; the server
                                // rejects others depending on request state.
                                await update.mutateAsync({
                                    patientName: values.patientName,
                                    patientAge: values.patientAge,
                                    unitsNeeded: values.unitsNeeded,
                                    hospitalName: values.hospitalName,
                                    urgency: values.urgency,
                                    neededBy: values.neededBy,
                                    notes: values.notes,
                                } as UpdateBloodRequestDto)
                                toast.success(t.updated)
                                navigate(localePath(`/requests/${id}`))
                            } catch (error) {
                                toast.error(toErrorMessage(error))
                            }
                        }}
                    />
                )}
            </DataState>
        </>
    )
}
