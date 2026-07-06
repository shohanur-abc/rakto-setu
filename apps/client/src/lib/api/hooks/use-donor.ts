import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
    donorsAcceptRequest,
    donorsConfirmCompletion,
    donorsDeclineRequest,
    donorsGetDonations,
    donorsGetEligibility,
    donorsGetMatchingRequests,
    donorsRegister,
    donorsUpdateAvailability,
    donorsUpdateProfile,
    type ConfirmDonorCompletionDto,
    type DonorsGetMatchingRequestsParams,
    type RegisterDonorDto,
    type UpdateAvailabilityDto,
    type UpdateDonorProfileDto,
} from "@/lib/api/generated/rakto-setu"
import { donorsGetProfile } from "@/lib/api/generated/rakto-setu"
import { unwrap } from "@/lib/api/unwrap"
import { queryKeys } from "@/lib/api/query-keys"

// ---- Donor profile & availability ----

export function useDonorProfile(enabled = true) {
    return useQuery({
        queryKey: queryKeys.donor.profile,
        enabled,
        // A user without a donor profile gets 404 — surface it as null so the
        // UI can prompt them to register instead of erroring.
        retry: false,
        queryFn: async () => unwrap(await donorsGetProfile()),
    })
}

export function useDonorEligibility(enabled = true) {
    return useQuery({
        queryKey: queryKeys.donor.eligibility,
        enabled,
        retry: false,
        queryFn: async () => unwrap(await donorsGetEligibility()),
    })
}

export function useDonorDonations(enabled = true) {
    return useQuery({
        queryKey: queryKeys.donor.donations,
        enabled,
        queryFn: async () => unwrap(await donorsGetDonations()),
    })
}

export function useDonorMatchingRequests(
    params?: DonorsGetMatchingRequestsParams
) {
    return useQuery({
        queryKey: queryKeys.donor.matching(params),
        queryFn: async () => unwrap(await donorsGetMatchingRequests(params)),
    })
}

export function useRegisterDonor() {
    const client = useQueryClient()
    return useMutation({
        mutationFn: async (dto: RegisterDonorDto) =>
            unwrap(await donorsRegister(dto)),
        onSuccess: () => {
            void client.invalidateQueries({ queryKey: ["donor"] })
            void client.invalidateQueries({ queryKey: queryKeys.auth.me })
        },
    })
}

export function useUpdateDonorProfile() {
    const client = useQueryClient()
    return useMutation({
        mutationFn: async (dto: UpdateDonorProfileDto) =>
            unwrap(await donorsUpdateProfile(dto)),
        onSuccess: () =>
            client.invalidateQueries({ queryKey: queryKeys.donor.profile }),
    })
}

export function useUpdateAvailability() {
    const client = useQueryClient()
    return useMutation({
        mutationFn: async (dto: UpdateAvailabilityDto) =>
            unwrap(await donorsUpdateAvailability(dto)),
        onSuccess: () => client.invalidateQueries({ queryKey: ["donor"] }),
    })
}

export function useAcceptRequest() {
    const client = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => unwrap(await donorsAcceptRequest(id)),
        onSuccess: () =>
            client.invalidateQueries({ queryKey: ["donor", "matching"] }),
    })
}

export function useDeclineRequest() {
    const client = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => unwrap(await donorsDeclineRequest(id)),
        onSuccess: () =>
            client.invalidateQueries({ queryKey: ["donor", "matching"] }),
    })
}

export function useDonorConfirmCompletion() {
    const client = useQueryClient()
    return useMutation({
        mutationFn: async (vars: {
            id: string
            dto: ConfirmDonorCompletionDto
        }) => unwrap(await donorsConfirmCompletion(vars.id, vars.dto)),
        onSuccess: () => client.invalidateQueries({ queryKey: ["donor"] }),
    })
}
