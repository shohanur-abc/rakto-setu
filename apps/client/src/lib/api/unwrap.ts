import { ApiError } from "@/lib/api/fetch-client"

export type ApiEnvelope<T> = {
    success: boolean
    data: T
    message: string
    errors: unknown[]
}

export function unwrap<T>(response: ApiEnvelope<T>) {
    if (!response.success) {
        throw new ApiError(response.message || "Request failed", 400, response)
    }

    return response.data
}
