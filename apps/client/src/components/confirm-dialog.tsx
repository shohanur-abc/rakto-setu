import type { ReactNode } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"
import { cn } from "@workspace/ui/lib/utils"
import { buttonVariants } from "@workspace/ui/components/button"
import { useI18n } from "@/lib/i18n/context"

interface ConfirmDialogProps {
    trigger: ReactNode
    title: string
    description?: string
    confirmLabel?: string
    /** Style the confirm button as destructive (default true). */
    destructive?: boolean
    onConfirm: () => void
}

/** Reusable confirmation gate for irreversible actions (delete, cancel, etc.). */
export function ConfirmDialog({
    trigger,
    title,
    description,
    confirmLabel,
    destructive = true,
    onConfirm,
}: ConfirmDialogProps) {
    const { dictionary } = useI18n()

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    {description && (
                        <AlertDialogDescription>
                            {description}
                        </AlertDialogDescription>
                    )}
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>
                        {dictionary.app.actions.cancel}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className={cn(
                            destructive &&
                                buttonVariants({ variant: "destructive" })
                        )}
                    >
                        {confirmLabel ?? dictionary.app.actions.confirm}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
