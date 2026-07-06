import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
    adminAssignDonor,
    adminCloseRequest,
    adminCreateAnnouncement,
    adminDashboard,
    adminDeleteAnnouncement,
    adminDeleteUser,
    adminGetSettings,
    adminGetUser,
    adminListRequests,
    adminListUsers,
    adminModerationQueue,
    adminPendingDonors,
    adminPublishRequest,
    adminRejectRequest,
    adminReports,
    adminUpdateAnnouncement,
    adminUpdateSettings,
    adminUpdateUserStatus,
    adminVerifyDonor,
    type AdminListRequestsParams,
    type AdminListUsersParams,
    type AdminReportsParams,
    type AssignDonorDto,
    type CloseRequestDto,
    type CreateAnnouncementDto,
    type UpdateAnnouncementDto,
    type UpdateSettingsDto,
    type UpdateUserStatusDto,
    type UserViewDto,
    type BloodRequestViewDto,
    type PageMetaDto,
} from "@/lib/api/generated/rakto-setu"
import { unwrap } from "@/lib/api/unwrap"
import { queryKeys } from "@/lib/api/query-keys"

// ---- Response shapes the spec leaves loose but the server returns ----
export interface DashboardMetrics {
    users: number
    activeDonors: number
    pendingDonors: number
    pendingRequests: number
    publishedRequests: number
    fulfilledRequests: number
}

export interface Paginated<T> {
    items: T[]
    meta: PageMetaDto
}

export interface PendingDonor {
    id: string
    userId: string
    fullName: string
    phone: string
    bloodGroup: string
    verification: string
    createdAt: string
}

export interface ReportSummary {
    requestsByStatus: { status: string; count: number }[]
    donations: number
}

export interface SystemSettings {
    donorCooldownDays: number
    metadata?: Record<string, unknown>
}

const cast = <T,>(value: unknown) => value as T

// ---- Queries ----

export function useAdminDashboard() {
    return useQuery({
        queryKey: queryKeys.admin.dashboard,
        queryFn: async () => cast<DashboardMetrics>(unwrap(await adminDashboard())),
    })
}

export function useAdminUsers(params?: AdminListUsersParams) {
    return useQuery({
        queryKey: queryKeys.admin.users(params),
        queryFn: async () =>
            cast<Paginated<UserViewDto>>(unwrap(await adminListUsers(params))),
    })
}

export function useAdminUser(id: string) {
    return useQuery({
        queryKey: queryKeys.admin.user(id),
        enabled: Boolean(id),
        queryFn: async () =>
            cast<UserViewDto & { donorProfile?: unknown }>(
                unwrap(await adminGetUser(id))
            ),
    })
}

export function useAdminPendingDonors() {
    return useQuery({
        queryKey: queryKeys.admin.pendingDonors,
        queryFn: async () =>
            cast<PendingDonor[]>(unwrap(await adminPendingDonors())),
    })
}

export function useAdminRequests(params?: AdminListRequestsParams) {
    return useQuery({
        queryKey: queryKeys.admin.requests(params),
        queryFn: async () =>
            cast<Paginated<BloodRequestViewDto>>(
                unwrap(await adminListRequests(params))
            ),
    })
}

export function useAdminReports(params?: AdminReportsParams) {
    return useQuery({
        queryKey: queryKeys.admin.reports(params),
        queryFn: async () =>
            cast<ReportSummary>(unwrap(await adminReports(params))),
    })
}

export function useAdminModeration() {
    return useQuery({
        queryKey: queryKeys.admin.moderation,
        queryFn: async () =>
            cast<unknown[]>(unwrap(await adminModerationQueue())),
    })
}

export function useAdminSettings() {
    return useQuery({
        queryKey: queryKeys.admin.settings,
        queryFn: async () =>
            cast<SystemSettings>(unwrap(await adminGetSettings())),
    })
}

// ---- Mutations ----

function useInvalidate() {
    const client = useQueryClient()
    return (key: readonly unknown[]) =>
        client.invalidateQueries({ queryKey: key as unknown[] })
}

export function useUpdateUserStatus() {
    const invalidate = useInvalidate()
    return useMutation({
        mutationFn: async (vars: { id: string; dto: UpdateUserStatusDto }) =>
            unwrap(await adminUpdateUserStatus(vars.id, vars.dto)),
        onSuccess: (_data, vars) => {
            void invalidate(["admin", "users"])
            void invalidate(queryKeys.admin.user(vars.id))
        },
    })
}

export function useDeleteUser() {
    const invalidate = useInvalidate()
    return useMutation({
        mutationFn: async (id: string) => unwrap(await adminDeleteUser(id)),
        onSuccess: () => invalidate(["admin", "users"]),
    })
}

export function useVerifyDonor() {
    const invalidate = useInvalidate()
    return useMutation({
        mutationFn: async (vars: {
            id: string
            verification: "verified" | "rejected"
        }) => unwrap(await adminVerifyDonor(vars.id, { verification: vars.verification })),
        onSuccess: () => {
            void invalidate(queryKeys.admin.pendingDonors)
            void invalidate(queryKeys.admin.dashboard)
        },
    })
}

export function usePublishRequest() {
    const invalidate = useInvalidate()
    return useMutation({
        mutationFn: async (id: string) => unwrap(await adminPublishRequest(id)),
        onSuccess: () => invalidate(["admin", "requests"]),
    })
}

export function useRejectRequest() {
    const invalidate = useInvalidate()
    return useMutation({
        mutationFn: async (id: string) => unwrap(await adminRejectRequest(id)),
        onSuccess: () => invalidate(["admin", "requests"]),
    })
}

export function useAssignDonor() {
    const invalidate = useInvalidate()
    return useMutation({
        mutationFn: async (vars: { id: string; dto: AssignDonorDto }) =>
            unwrap(await adminAssignDonor(vars.id, vars.dto)),
        onSuccess: () => invalidate(["admin", "requests"]),
    })
}

export function useCloseRequest() {
    const invalidate = useInvalidate()
    return useMutation({
        mutationFn: async (vars: { id: string; dto: CloseRequestDto }) =>
            unwrap(await adminCloseRequest(vars.id, vars.dto)),
        onSuccess: () => invalidate(["admin", "requests"]),
    })
}

export function useCreateAnnouncement() {
    const invalidate = useInvalidate()
    return useMutation({
        mutationFn: async (dto: CreateAnnouncementDto) =>
            unwrap(await adminCreateAnnouncement(dto)),
        onSuccess: () => invalidate(["announcements"]),
    })
}

export function useUpdateAnnouncement() {
    const invalidate = useInvalidate()
    return useMutation({
        mutationFn: async (vars: { id: string; dto: UpdateAnnouncementDto }) =>
            unwrap(await adminUpdateAnnouncement(vars.id, vars.dto)),
        onSuccess: () => invalidate(["announcements"]),
    })
}

export function useDeleteAnnouncement() {
    const invalidate = useInvalidate()
    return useMutation({
        mutationFn: async (id: string) =>
            unwrap(await adminDeleteAnnouncement(id)),
        onSuccess: () => invalidate(["announcements"]),
    })
}

export function useUpdateSettings() {
    const invalidate = useInvalidate()
    return useMutation({
        mutationFn: async (dto: UpdateSettingsDto) =>
            unwrap(await adminUpdateSettings(dto)),
        onSuccess: () => invalidate(queryKeys.admin.settings),
    })
}
