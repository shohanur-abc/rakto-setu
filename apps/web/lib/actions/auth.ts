"use server"

import {
    authLogin,
    authLogout,
    authRegister,
    type RegisterDtoBloodGroup,
    type RegisterDtoPreferredLanguage,
    type UserViewDto,
} from "@/lib/api/generated/rakto-setu"
import {
    clearSessionToken,
    getSessionToken,
    setSessionToken,
} from "@/lib/auth/session"
import type { Locale } from "@/lib/i18n/config"

export interface AuthActionState {
    ok: boolean
    message: string
    user?: UserViewDto
}

const getString = (formData: FormData, key: string) => {
    const value = formData.get(key)

    return typeof value === "string" ? value.trim() : ""
}

const getOptionalString = (formData: FormData, key: string) => {
    const value = getString(formData, key)

    return value.length > 0 ? value : undefined
}

const getErrorMessage = (error: unknown) =>
    error instanceof Error ? error.message : "Something went wrong"

export async function loginAction(
    _state: AuthActionState,
    formData: FormData
): Promise<AuthActionState> {
    try {
        const response = await authLogin({
            phone: getString(formData, "phone"),
            password: getString(formData, "password"),
        })

        await setSessionToken(response.data.token)

        return {
            ok: true,
            message: "Logged in successfully.",
            user: response.data.user,
        }
    } catch (error) {
        return { ok: false, message: getErrorMessage(error) }
    }
}

export async function registerAction(
    _state: AuthActionState,
    formData: FormData
): Promise<AuthActionState> {
    try {
        const preferredLanguage =
            (getOptionalString(formData, "preferredLanguage") as
                | RegisterDtoPreferredLanguage
                | undefined) ?? ("bn" as RegisterDtoPreferredLanguage)
        const bloodGroup = getOptionalString(formData, "bloodGroup") as
            | RegisterDtoBloodGroup
            | undefined
        const response = await authRegister({
            fullName: getString(formData, "fullName"),
            phone: getString(formData, "phone"),
            email: getOptionalString(formData, "email"),
            password: getString(formData, "password"),
            locationId: getOptionalString(formData, "locationId"),
            bloodGroup,
            preferredLanguage,
        })

        return {
            ok: true,
            message:
                preferredLanguage === "bn"
                    ? "নিবন্ধন সম্পন্ন হয়েছে। লগইনের আগে ফোন যাচাই করুন।"
                    : "Registration complete. Verify the phone before login.",
            user: response.data,
        }
    } catch (error) {
        return { ok: false, message: getErrorMessage(error) }
    }
}

export async function logoutAction(locale: Locale) {
    const token = await getSessionToken()

    if (token) {
        try {
            await authLogout(
                { allSessions: false },
                {
                    cache: "no-store",
                    headers: { authorization: `Bearer ${token}` },
                }
            )
        } catch {
            // Clearing the local cookie is still the right recovery path.
        }
    }

    await clearSessionToken()

    return { ok: true, redirectTo: `/${locale}` }
}
