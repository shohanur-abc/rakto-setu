import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { RiArrowLeftLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"
import { PageHeader } from "@/components/page-header"
import { RequestForm } from "@/routes/recipient/request-form"
import { useCreateRequest } from "@/lib/api/hooks/use-requests"
import { toErrorMessage } from "@/lib/api/error"
import { useI18n } from "@/lib/i18n/context"
import type { CreateBloodRequestDto } from "@/lib/api/generated/rakto-setu"

export function RequestNewPage() {
    const { dictionary, localePath } = useI18n()
    const t = dictionary.app.recipient
    const navigate = useNavigate()
    const create = useCreateRequest()

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                asChild
                className="mb-2 -ml-2 gap-1"
            >
                <a href={localePath("/requests")}>
                    <RiArrowLeftLine className="size-4" />
                    {t.requestsTitle}
                </a>
            </Button>
            <PageHeader title={t.newTitle} description={t.newDesc} />

            <RequestForm
                submitLabel={dictionary.app.actions.submit}
                pending={create.isPending}
                onSubmit={async (values) => {
                    try {
                        await create.mutateAsync(
                            values as CreateBloodRequestDto
                        )
                        toast.success(t.created)
                        navigate(localePath("/requests"))
                    } catch (error) {
                        toast.error(toErrorMessage(error))
                    }
                }}
            />
        </>
    )
}
