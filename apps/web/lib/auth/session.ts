import "server-only"

import { cookies } from "next/headers"
import {
    authMe,
    type UserViewDto,
} from "@/lib/api/generated/rakto-setu"

export const SESSION_COOKIE = "rakto-setu.session"

export async function getSessionToken() {
    return (await cookies()).get(SESSION_COOKIE)?.value ?? null
}

export async function setSessionToken(token: string) {
    ;(await cookies()).set(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    })
}

export async function clearSessionToken() {
    ;(await cookies()).delete(SESSION_COOKIE)
}

export async function getCurrentUser(): Promise<UserViewDto | null> {
    const token = await getSessionToken()

    if (!token) {
        return null
    }

    try {
        const response = await authMe({
            cache: "no-store",
            headers: { authorization: `Bearer ${token}` },
        })

        return response.data
    } catch {
        return null
    }
}
