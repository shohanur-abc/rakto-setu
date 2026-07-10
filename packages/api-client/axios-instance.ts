import axios, { AxiosError, AxiosRequestConfig } from 'axios'

/**
 * Orval mutator (axios) — single instance, used by every generated hook.
 *
 * Backend envelope: { success, data, message, errors }
 * @SkipEnvelope() endpoints skip this shape — returned as-is.
 *
 * Auth model: the NestJS backend issues a JWT in the login response body
 * (`{ user, token }`) and expects it back as `Authorization: Bearer <token>`.
 * It does NOT use cookies. The token is stored client-side (see
 * `apps/web/lib/auth-store.ts`) and injected here via a request interceptor.
 *
 * The `baseURL` is intentionally empty — generated request URLs already
 * include the `/api/v1/...` prefix, so requests are relative to the current
 * origin. In the browser they hit the Next.js rewrite proxy (see
 * `apps/web/next.config.ts`) which forwards to the API on port 5000,
 * keeping everything same-origin (no CORS, no credentialed cross-origin).
 */

let tokenGetter: (() => string | null) | null = null

/**
 * Let the web app plug in its token source without creating a circular
 * dependency between `api-client` and the web app's store.
 */
export function configureAuthToken(getter: () => string | null) {
    tokenGetter = getter
}

const api = axios.create({
    baseURL: '/',
    withCredentials: false,
})

api.interceptors.request.use((config) => {
    const token = tokenGetter?.()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export interface ApiFieldError {
    field: string
    message: string
}

export class ApiError extends Error {
    constructor(
        public status: number,
        public errors: (string | ApiFieldError)[],
    ) {
        super(errors[0] ? (typeof errors[0] === 'string' ? errors[0] : errors[0].message) : 'Request failed')
        this.name = 'ApiError'
    }

    /** Field-level validation error, e.g. err.fieldError('email') */
    fieldError(field: string): string | undefined {
        const match = this.errors.find(
            (e): e is ApiFieldError => typeof e === 'object' && e !== null && 'field' in e && e.field === field,
        )
        return match?.message
    }

    /** All messages as plain strings, regardless of string[]/FieldError[] shape */
    get messages(): string[] {
        return this.errors.map((e) => (typeof e === 'string' ? e : e.message))
    }
}

export type ErrorType<TError = unknown> = ApiError

export const apiFetch = async <T>(config: AxiosRequestConfig): Promise<T> => {
    try {
        const { data } = await api(config)
        return data && typeof data === 'object' && 'success' in data ? data.data : data
    } catch (err) {
        const e = err as AxiosError<{ message: string; errors: (string | ApiFieldError)[] }>
        throw new ApiError(e.response?.status ?? 0, e.response?.data?.errors ?? [e.message])
    }
}

export default apiFetch
