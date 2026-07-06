import { QueryClient } from "@tanstack/react-query"
import { ApiError } from "@/lib/api/fetch-client"

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            retry: (failureCount, error) => {
                // Never retry auth/permission failures — a refresh has already
                // been attempted inside the fetch client.
                if (
                    error instanceof ApiError &&
                    [401, 403, 404].includes(error.status)
                ) {
                    return false
                }

                return failureCount < 2
            },
            refetchOnWindowFocus: false,
        },
    },
})
