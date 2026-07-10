"use client"

import { useQueryClient } from "@tanstack/react-query"
import {
    getAuthMeQueryKey,
    useAuthChangePassword,
    useAuthCheckAvailability,
    useAuthForgotPassword,
    useAuthLogout,
    useAuthMe,
    useAuthRequestOtp,
    useAuthResetPassword,
    useAuthVerifyOtp,
} from "api-client/src/auth"
import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { ApiGrid, ApiSection, ErrorState, FieldList, JsonPanel, SubmitButton, TextField, formValue } from "@/components/api-surface"
import { useAuthStore } from "@/lib/auth-store"

export function AuthActionsClient() {
    const queryClient = useQueryClient()
    const clearAuth = useAuthStore((state) => state.clear)
    const me = useAuthMe()
    const check = useAuthCheckAvailability()
    const requestOtp = useAuthRequestOtp()
    const verifyOtp = useAuthVerifyOtp()
    const forgot = useAuthForgotPassword()
    const reset = useAuthResetPassword()
    const change = useAuthChangePassword()
    const logout = useAuthLogout({
        mutation: {
            onSuccess: () => {
                clearAuth()
                queryClient.invalidateQueries({ queryKey: getAuthMeQueryKey() })
            },
        },
    })

    return (
        <>
            <PageHeader eyebrow="Auth" title="Authentication actions" subtitle="OTP, availability, password, session, and current-user endpoints." />
            <Container className="space-y-4 py-10 @2xl:py-12">
                <ApiSection title="Current user" description="GET /api/v1/auth/me">
                    {me.error ? <ErrorState error={me.error} /> : me.isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : me.data ? (
                        <FieldList items={[["Name", me.data.fullName], ["Phone", me.data.phone], ["Role", me.data.role], ["Status", me.data.status]]} />
                    ) : null}
                </ApiSection>
                <ApiGrid>
                    <ApiSection title="Check availability" description="POST /api/v1/auth/check-availability">
                        <form
                            className="space-y-3"
                            onSubmit={(event) => {
                                event.preventDefault()
                                check.mutate({ data: { phone: formValue(event.currentTarget, "phone"), email: formValue(event.currentTarget, "email") } })
                            }}
                        >
                            <TextField name="phone" label="Phone" placeholder="+8801XXXXXXXXX" />
                            <TextField name="email" label="Email" type="email" />
                            <SubmitButton pending={check.isPending}>Check</SubmitButton>
                        </form>
                        {check.error && <ErrorState error={check.error} />}
                        {check.data && <JsonPanel value={check.data} />}
                    </ApiSection>
                    <ApiSection title="OTP" description="POST /auth/otp/request and /auth/otp/verify">
                        <form
                            className="space-y-3"
                            onSubmit={(event) => {
                                event.preventDefault()
                                requestOtp.mutate({ data: { phone: formValue(event.currentTarget, "phone") ?? "" } })
                            }}
                        >
                            <TextField name="phone" label="Phone" required placeholder="+8801XXXXXXXXX" />
                            <SubmitButton pending={requestOtp.isPending}>Request OTP</SubmitButton>
                        </form>
                        <form
                            className="mt-4 space-y-3"
                            onSubmit={(event) => {
                                event.preventDefault()
                                verifyOtp.mutate({ data: { phone: formValue(event.currentTarget, "phone") ?? "", code: formValue(event.currentTarget, "code") ?? "" } })
                            }}
                        >
                            <TextField name="phone" label="Phone" required />
                            <TextField name="code" label="OTP code" required />
                            <SubmitButton pending={verifyOtp.isPending}>Verify OTP</SubmitButton>
                        </form>
                        {(requestOtp.error || verifyOtp.error) && <ErrorState error={requestOtp.error ?? verifyOtp.error} />}
                        {(requestOtp.data || verifyOtp.data) && <JsonPanel value={requestOtp.data ?? verifyOtp.data} />}
                    </ApiSection>
                    <ApiSection title="Password reset" description="POST /auth/password/forgot and /auth/password/reset">
                        <form
                            className="space-y-3"
                            onSubmit={(event) => {
                                event.preventDefault()
                                forgot.mutate({ data: { phone: formValue(event.currentTarget, "phone") ?? "" } })
                            }}
                        >
                            <TextField name="phone" label="Phone" required />
                            <SubmitButton pending={forgot.isPending}>Send reset code</SubmitButton>
                        </form>
                        <form
                            className="mt-4 space-y-3"
                            onSubmit={(event) => {
                                event.preventDefault()
                                reset.mutate({
                                    data: {
                                        phone: formValue(event.currentTarget, "phone") ?? "",
                                        code: formValue(event.currentTarget, "code") ?? "",
                                        newPassword: formValue(event.currentTarget, "newPassword") ?? "",
                                    },
                                })
                            }}
                        >
                            <TextField name="phone" label="Phone" required />
                            <TextField name="code" label="Reset code" required />
                            <TextField name="newPassword" label="New password" type="password" required />
                            <SubmitButton pending={reset.isPending}>Reset password</SubmitButton>
                        </form>
                        {(forgot.error || reset.error) && <ErrorState error={forgot.error ?? reset.error} />}
                        {(forgot.data || reset.data) && <JsonPanel value={forgot.data ?? reset.data} />}
                    </ApiSection>
                    <ApiSection title="Private auth actions" description="POST /auth/password/change and /auth/logout">
                        <form
                            className="space-y-3"
                            onSubmit={(event) => {
                                event.preventDefault()
                                change.mutate({
                                    data: {
                                        currentPassword: formValue(event.currentTarget, "currentPassword") ?? "",
                                        newPassword: formValue(event.currentTarget, "newPassword") ?? "",
                                    },
                                })
                            }}
                        >
                            <TextField name="currentPassword" label="Current password" type="password" required />
                            <TextField name="newPassword" label="New password" type="password" required />
                            <SubmitButton pending={change.isPending}>Change password</SubmitButton>
                        </form>
                        <form
                            className="mt-4"
                            onSubmit={(event) => {
                                event.preventDefault()
                                logout.mutate({ data: { allSessions: false } })
                            }}
                        >
                            <SubmitButton pending={logout.isPending} variant="outline">Log out</SubmitButton>
                        </form>
                        {(change.error || logout.error) && <ErrorState error={change.error ?? logout.error} />}
                        {(change.data || logout.data) && <JsonPanel value={change.data ?? logout.data} />}
                    </ApiSection>
                </ApiGrid>
            </Container>
        </>
    )
}
