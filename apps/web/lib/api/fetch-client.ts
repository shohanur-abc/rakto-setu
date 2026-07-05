export class ApiError<TBody = unknown> extends Error {
    constructor(
        message: string,
        readonly status: number,
        readonly body: TBody
    ) {
        super(message)
        this.name = "ApiError"
    }
}

const getApiBaseUrl = () =>
    (
        (typeof window === "undefined"
            ? process.env.API_URL
            : process.env.NEXT_PUBLIC_API_URL) ??
        process.env.NEXT_PUBLIC_API_URL ??
        "http://localhost:5000"
    ).replace(/\/$/, "")

const getAccessToken = () => {
    if (typeof window === "undefined") {
        return undefined
    }

    return window.localStorage.getItem("rakto-setu.access-token") ?? undefined
}

const parseBody = async (response: Response) => {
    if ([204, 205, 304].includes(response.status)) {
        return undefined
    }

    const text = await response.text()

    if (!text) {
        return undefined
    }

    const contentType = response.headers.get("content-type") ?? ""

    if (!contentType.includes("application/json")) {
        return text
    }

    return JSON.parse(text) as unknown
}

export async function apiFetch<TData>(
    url: string,
    options: RequestInit = {}
): Promise<TData> {
    const headers = new Headers(options.headers)
    const accessToken = getAccessToken()

    if (accessToken && !headers.has("authorization")) {
        headers.set("authorization", `Bearer ${accessToken}`)
    }

    const response = await fetch(`${getApiBaseUrl()}${url}`, {
        ...options,
        headers,
    })
    const body = await parseBody(response)

    if (!response.ok) {
        const message =
            body &&
                typeof body === "object" &&
                "message" in body &&
                typeof body.message === "string"
                ? body.message
                : `Request failed with status ${response.status}`

        throw new ApiError(message, response.status, body)
    }

    return body as TData
}
