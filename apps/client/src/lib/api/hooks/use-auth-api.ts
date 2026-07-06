import { useMutation, useQuery } from "@tanstack/react-query"
import {
    authChangePassword,
    authForgotPassword,
    authMe,
    authRegister,
    authRequestOtp,
    authResetPassword,
    authVerifyOtp,
    type ChangePasswordDto,
    type ForgotPasswordDto,
    type OtpRequestDto,
    type OtpVerifyDto,
    type RegisterDto,
    type ResetPasswordDto,
} from "@/lib/api/generated/rakto-setu"
import { unwrap } from "@/lib/api/unwrap"
import { queryKeys } from "@/lib/api/query-keys"

// Auth / account mutations. Each returns the unwrapped `data` payload so
// callers get typed results without unwrapping the envelope themselves.

export function useRegister() {
    return useMutation({
        mutationFn: async (dto: RegisterDto) => unwrap(await authRegister(dto)),
    })
}

export function useRequestOtp() {
    return useMutation({
        mutationFn: async (dto: OtpRequestDto) =>
            unwrap(await authRequestOtp(dto)),
    })
}

export function useVerifyOtp() {
    return useMutation({
        mutationFn: async (dto: OtpVerifyDto) => unwrap(await authVerifyOtp(dto)),
    })
}

export function useForgotPassword() {
    return useMutation({
        mutationFn: async (dto: ForgotPasswordDto) =>
            unwrap(await authForgotPassword(dto)),
    })
}

export function useResetPassword() {
    return useMutation({
        mutationFn: async (dto: ResetPasswordDto) =>
            unwrap(await authResetPassword(dto)),
    })
}

export function useChangePassword() {
    return useMutation({
        mutationFn: async (dto: ChangePasswordDto) =>
            unwrap(await authChangePassword(dto)),
    })
}

/** The authenticated user; disabled until we know a session exists. */
export function useMe(enabled = true) {
    return useQuery({
        queryKey: queryKeys.auth.me,
        enabled,
        queryFn: async () => unwrap(await authMe()),
    })
}
