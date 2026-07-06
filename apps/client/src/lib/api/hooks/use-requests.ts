import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
    requestsCancel,
    requestsConfirmCompletion,
    requestsCreate,
    requestsGetMatches,
    requestsGetOwn,
    requestsGetStatus,
    requestsListOwn,
    requestsUpdate,
    type ConfirmRecipientCompletionDto,
    type CreateBloodRequestDto,
    type RequestsListOwnParams,
    type UpdateBloodRequestDto,
} from "@/lib/api/generated/rakto-setu"
import { unwrap } from "@/lib/api/unwrap"
import { queryKeys } from "@/lib/api/query-keys"

// ---- Recipient-owned blood requests ----

export function useOwnRequests(params?: RequestsListOwnParams) {
    return useQuery({
        queryKey: queryKeys.requests.own(params),
        queryFn: async () => unwrap(await requestsListOwn(params)),
    })
}

export function useOwnRequest(id: string) {
    return useQuery({
        queryKey: queryKeys.requests.detail(id),
        enabled: Boolean(id),
        queryFn: async () => unwrap(await requestsGetOwn(id)),
    })
}

export function useRequestStatus(id: string) {
    return useQuery({
        queryKey: queryKeys.requests.status(id),
        enabled: Boolean(id),
        queryFn: async () => unwrap(await requestsGetStatus(id)),
    })
}

export function useRequestMatches(id: string) {
    return useQuery({
        queryKey: queryKeys.requests.matches(id),
        enabled: Boolean(id),
        queryFn: async () => unwrap(await requestsGetMatches(id)),
    })
}

export function useCreateRequest() {
    const client = useQueryClient()
    return useMutation({
        mutationFn: async (dto: CreateBloodRequestDto) =>
            unwrap(await requestsCreate(dto)),
        onSuccess: () =>
            client.invalidateQueries({ queryKey: ["requests", "own"] }),
    })
}

export function useUpdateRequest(id: string) {
    const client = useQueryClient()
    return useMutation({
        mutationFn: async (dto: UpdateBloodRequestDto) =>
            unwrap(await requestsUpdate(id, dto)),
        onSuccess: () => {
            void client.invalidateQueries({ queryKey: ["requests", "own"] })
            void client.invalidateQueries({
                queryKey: queryKeys.requests.detail(id),
            })
        },
    })
}

export function useCancelRequest(id: string) {
    const client = useQueryClient()
    return useMutation({
        mutationFn: async () => unwrap(await requestsCancel(id)),
        onSuccess: () => {
            void client.invalidateQueries({ queryKey: ["requests", "own"] })
            void client.invalidateQueries({
                queryKey: queryKeys.requests.detail(id),
            })
        },
    })
}

export function useConfirmRequestCompletion(id: string) {
    const client = useQueryClient()
    return useMutation({
        mutationFn: async (dto: ConfirmRecipientCompletionDto) =>
            unwrap(await requestsConfirmCompletion(id, dto)),
        onSuccess: () => {
            void client.invalidateQueries({
                queryKey: queryKeys.requests.detail(id),
            })
            void client.invalidateQueries({
                queryKey: queryKeys.requests.matches(id),
            })
        },
    })
}
