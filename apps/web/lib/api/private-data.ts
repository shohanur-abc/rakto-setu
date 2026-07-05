import "server-only"

import { redirect } from "next/navigation"
import {
    adminDashboard,
    adminGetSettings,
    adminListRequests,
    adminListUsers,
    adminModerationQueue,
    adminPendingDonors,
    adminReports,
    donorsGetDonations,
    donorsGetEligibility,
    donorsGetMatchingRequests,
    donorsGetProfile,
    notificationsList,
    notificationsUnreadCount,
    requestsGetMatches,
    requestsGetOwn,
    requestsGetStatus,
    requestsListOwn,
    usersGetProfile,
    type AnnouncementViewDto,
    type BloodRequestViewDto,
    type LocationViewDto,
    type PageMetaDto,
    type RequestsListOwnParams,
    type AdminListRequestsParams,
    type AdminListUsersParams,
    type AdminReportsParams,
    type UserViewDto,
} from "@/lib/api/generated/rakto-setu"
import { unwrap } from "@/lib/api/unwrap"
import { getSessionToken } from "@/lib/auth/session"
import type { Locale } from "@/lib/i18n/config"

export type PageView<T> = {
    items: T[]
    meta: PageMetaDto
}

export type DonorProfileView = {
    id: string
    userId: string
    fullName: string
    phone: string
    bloodGroup: string
    isAvailable: boolean
    verification: "unverified" | "verified" | "rejected"
    lastDonationDate?: string | null
    nextEligibleDate?: string | null
    totalDonations: number
    notes?: string | null
}

export type MatchingRequestView = Pick<
    BloodRequestViewDto,
    | "id"
    | "patientName"
    | "bloodGroup"
    | "unitsNeeded"
    | "hospitalName"
    | "urgency"
    | "neededBy"
    | "status"
> & {
    location?: LocationViewDto | null
}

export type DonationView = {
    id: string
    donationDate: string
    units: number
    requestId?: string | null
    patientName?: string | null
    createdAt: string
}

export type DonorEligibilityView = {
    eligible: boolean
    isAvailable: boolean
    verification: string
    nextEligibleDate?: string | null
}

export type NotificationView = {
    id: string
    type: string
    title: string
    body: string
    referenceId?: string | null
    isRead: boolean
    channel: string
    createdAt: string
}

export type RequestMatchView = {
    id: string
    status: string
    donorConfirmedCompletion: boolean
    recipientConfirmedCompletion: boolean
    respondedAt: string
    donor: {
        id: string
        fullName: string
        phone: string
        email?: string | null
        bloodGroup?: string | null
    }
}

export type RequestStatusView = {
    id: string
    status: string
    unitsNeeded: number
    unitsFulfilled: number
    updatedAt: string
}

export type AdminDashboardView = {
    users: number
    activeDonors: number
    pendingDonors: number
    pendingRequests: number
    publishedRequests: number
    fulfilledRequests: number
}

export type AdminPendingDonorView = {
    id: string
    userId: string
    fullName: string
    phone: string
    bloodGroup: string
    verification: string
    createdAt: string
}

export type AdminReportView = {
    requestsByStatus: Array<{ status: string; count: number }>
    donations: number
}

export type AdminSettingsView = {
    donorCooldownDays: number
    metadata?: Record<string, unknown> | null
}

const authOptions = async (locale: Locale): Promise<RequestInit> => {
    const token = await getSessionToken()

    if (!token) {
        redirect(`/${locale}/login`)
    }

    return {
        cache: "no-store",
        headers: { authorization: `Bearer ${token}` },
    }
}

export async function getPrivateProfile(locale: Locale) {
    return unwrap(await usersGetProfile(await authOptions(locale)))
}

export async function getOwnRequests(
    locale: Locale,
    params?: RequestsListOwnParams
) {
    return unwrap(await requestsListOwn(params, await authOptions(locale)))
}

export async function getOwnRequest(locale: Locale, id: string) {
    return unwrap(await requestsGetOwn(id, await authOptions(locale)))
}

export async function getOwnRequestStatus(locale: Locale, id: string) {
    return unwrap(
        await requestsGetStatus(id, await authOptions(locale))
    ) as RequestStatusView
}

export async function getOwnRequestMatches(locale: Locale, id: string) {
    return unwrap(
        await requestsGetMatches(id, await authOptions(locale))
    ) as unknown as RequestMatchView[]
}

export async function getDonorProfile(locale: Locale) {
    return unwrap(
        await donorsGetProfile(await authOptions(locale))
    ) as DonorProfileView
}

export async function getDonorMatchingRequests(locale: Locale) {
    return unwrap(
        await donorsGetMatchingRequests(undefined, await authOptions(locale))
    ) as unknown as MatchingRequestView[]
}

export async function getDonorDonations(locale: Locale) {
    return unwrap(
        await donorsGetDonations(await authOptions(locale))
    ) as unknown as DonationView[]
}

export async function getDonorEligibility(locale: Locale) {
    return unwrap(
        await donorsGetEligibility(await authOptions(locale))
    ) as DonorEligibilityView
}

export async function getNotifications(locale: Locale) {
    return unwrap(
        await notificationsList(await authOptions(locale))
    ) as unknown as NotificationView[]
}

export async function getUnreadCount(locale: Locale) {
    return unwrap(
        await notificationsUnreadCount(await authOptions(locale))
    ) as { count: number }
}

export async function getAdminDashboard(locale: Locale) {
    return unwrap(
        await adminDashboard(await authOptions(locale))
    ) as AdminDashboardView
}

export async function getAdminUsers(
    locale: Locale,
    params?: AdminListUsersParams
) {
    return unwrap(
        await adminListUsers(params, await authOptions(locale))
    ) as PageView<UserViewDto>
}

export async function getAdminPendingDonors(locale: Locale) {
    return unwrap(
        await adminPendingDonors(await authOptions(locale))
    ) as unknown as AdminPendingDonorView[]
}

export async function getAdminRequests(
    locale: Locale,
    params?: AdminListRequestsParams
) {
    return unwrap(
        await adminListRequests(params, await authOptions(locale))
    ) as PageView<BloodRequestViewDto>
}

export async function getAdminReports(
    locale: Locale,
    params?: AdminReportsParams
) {
    return unwrap(
        await adminReports(params, await authOptions(locale))
    ) as AdminReportView
}

export async function getAdminModerationQueue(locale: Locale) {
    return unwrap(
        await adminModerationQueue(await authOptions(locale))
    ) as unknown as unknown[]
}

export async function getAdminSettings(locale: Locale) {
    return unwrap(
        await adminGetSettings(await authOptions(locale))
    ) as AdminSettingsView
}

export type AnnouncementFormView = AnnouncementViewDto
