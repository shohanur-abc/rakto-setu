import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
    usersGetProfile,
    usersUpdateProfile,
    type UpdateProfileDto,
} from "@/lib/api/generated/rakto-setu"
import { unwrap } from "@/lib/api/unwrap"
import { queryKeys } from "@/lib/api/query-keys"

export function useProfile(enabled = true) {
    return useQuery({
        queryKey: queryKeys.profile.me,
        enabled,
        queryFn: async () => unwrap(await usersGetProfile()),
    })
}

export function useUpdateProfile() {
    const client = useQueryClient()
    return useMutation({
        mutationFn: async (dto: UpdateProfileDto) =>
            unwrap(await usersUpdateProfile(dto)),
        onSuccess: () => {
            void client.invalidateQueries({ queryKey: queryKeys.profile.me })
            void client.invalidateQueries({ queryKey: queryKeys.auth.me })
        },
    })
}
