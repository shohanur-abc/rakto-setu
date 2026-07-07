import { useState } from "react"
import { toast } from "sonner"
import { RiAddLine, RiEdit2Line } from "@remixicon/react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Field, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Switch } from "@workspace/ui/components/switch"
import { Textarea } from "@workspace/ui/components/textarea"
import { PageHeader } from "@/components/page-header"
import { DataState } from "@/components/data-state"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useAnnouncements } from "@/lib/api/public-data"
import {
    useCreateAnnouncement,
    useDeleteAnnouncement,
    useUpdateAnnouncement,
} from "@/lib/api/hooks/use-admin"
import { toErrorMessage } from "@/lib/api/error"
import { useI18n } from "@/lib/i18n/context"
import { formatDate } from "@/lib/format"
import type { AnnouncementViewDto } from "@/lib/api/generated/rakto-setu"

export function AdminAnnouncementsPage() {
    const { dictionary } = useI18n()
    const t = dictionary.app.admin
    const query = useAnnouncements()
    const remove = useDeleteAnnouncement()
    const announcements = query.data ?? []

    return (
        <>
            <PageHeader
                title={t.announcementsTitle}
                description={t.announcementsDesc}
                actions={
                    <AnnouncementDialog
                        trigger={
                            <Button size="sm" className="gap-1.5">
                                <RiAddLine className="size-4" />
                                {t.newAnnouncement}
                            </Button>
                        }
                    />
                }
            />

            <DataState
                isLoading={query.isLoading}
                isError={query.isError}
                isEmpty={announcements.length === 0}
                onRetry={() => query.refetch()}
            >
                <div className="flex flex-col gap-3">
                    {announcements.map((item) => (
                        <Card key={item.id} className="rounded-lg">
                            <CardHeader className="flex flex-row items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-heading font-semibold">
                                            {item.title}
                                        </h3>
                                        <Badge
                                            variant="outline"
                                            className="text-xs"
                                        >
                                            {item.isPublished
                                                ? t.published
                                                : t.unpublished}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDate(item.createdAt)}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <AnnouncementDialog
                                        existing={item}
                                        trigger={
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={
                                                    dictionary.app.actions.edit
                                                }
                                            >
                                                <RiEdit2Line className="size-4" />
                                            </Button>
                                        }
                                    />
                                    <ConfirmDialog
                                        title={t.announcementDeleteConfirm}
                                        confirmLabel={
                                            dictionary.app.actions.delete
                                        }
                                        onConfirm={async () => {
                                            try {
                                                await remove.mutateAsync(item.id)
                                                toast.success(
                                                    t.announcementDeleted
                                                )
                                            } catch (error) {
                                                toast.error(
                                                    toErrorMessage(error)
                                                )
                                            }
                                        }}
                                        trigger={
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive"
                                            >
                                                {dictionary.app.actions.delete}
                                            </Button>
                                        }
                                    />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-line text-sm text-muted-foreground">
                                    {item.body}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </DataState>
        </>
    )
}

function AnnouncementDialog({
    trigger,
    existing,
}: {
    trigger: React.ReactNode
    existing?: AnnouncementViewDto
}) {
    const { dictionary } = useI18n()
    const t = dictionary.app.admin
    const create = useCreateAnnouncement()
    const update = useUpdateAnnouncement()
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState(existing?.title ?? "")
    const [body, setBody] = useState(existing?.body ?? "")
    const [isPublished, setIsPublished] = useState(existing?.isPublished ?? true)

    const pending = create.isPending || update.isPending

    const submit = async () => {
        try {
            if (existing) {
                await update.mutateAsync({
                    id: existing.id,
                    dto: { title, body, isPublished },
                })
            } else {
                await create.mutateAsync({ title, body, isPublished })
            }
            toast.success(t.announcementSaved)
            setOpen(false)
        } catch (error) {
            toast.error(toErrorMessage(error))
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {existing ? dictionary.app.actions.edit : t.newAnnouncement}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Field>
                        <FieldLabel htmlFor="a-title">
                            {t.announcementTitle}
                        </FieldLabel>
                        <Input
                            id="a-title"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="a-body">
                            {t.announcementBody}
                        </FieldLabel>
                        <Textarea
                            id="a-body"
                            rows={5}
                            value={body}
                            onChange={(event) => setBody(event.target.value)}
                        />
                    </Field>
                    <label className="flex items-center gap-3 text-sm">
                        <Switch
                            checked={isPublished}
                            onCheckedChange={setIsPublished}
                        />
                        {t.published}
                    </label>
                </div>
                <DialogFooter>
                    <Button
                        onClick={submit}
                        disabled={pending || !title || !body}
                    >
                        {dictionary.app.actions.save}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
