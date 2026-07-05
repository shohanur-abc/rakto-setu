"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
    adminAssignDonor,
    adminCloseRequest,
    adminCreateAnnouncement,
    adminDeleteAnnouncement,
    adminPublishRequest,
    adminRejectRequest,
    adminUpdateAnnouncement,
    adminUpdateSettings,
    adminUpdateUserStatus,
    adminVerifyDonor,
    donorsAcceptRequest,
    donorsConfirmCompletion,
    donorsDeclineRequest,
    donorsRegister,
    donorsUpdateAvailability,
    donorsUpdateProfile,
    notificationsMarkAllRead,
    notificationsMarkRead,
    requestsCancel,
    requestsConfirmCompletion,
    requestsCreate,
    requestsUpdate,
    usersUpdateProfile,
    type CloseRequestDtoStatus,
    type CreateBloodRequestDtoBloodGroup,
    type CreateBloodRequestDtoUrgency,
    type RegisterDonorDtoBloodGroup,
    type UpdateBloodRequestDtoUrgency,
    type UpdateDonorProfileDtoBloodGroup,
    type UpdateProfileDtoBloodGroup,
    type UpdateProfileDtoPreferredLanguage,
    type UpdateUserStatusDtoStatus,
    type VerifyDonorDtoVerification,
} from "@/lib/api/generated/rakto-setu"
import { getSessionToken } from "@/lib/auth/session"
import type { Locale } from "@/lib/i18n/config"

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

const text = (formData: FormData, key: string) => {
    const value = formData.get(key)

    return typeof value === "string" ? value.trim() : ""
}

const optionalText = (formData: FormData, key: string) => {
    const value = text(formData, key)

    return value.length > 0 ? value : undefined
}

const optionalNumber = (formData: FormData, key: string) => {
    const value = optionalText(formData, key)

    return value ? Number(value) : undefined
}

const boolValue = (formData: FormData, key: string) =>
    formData.get(key) === "true" || formData.get(key) === "on"

export async function updateProfileAction(locale: Locale, formData: FormData) {
    await usersUpdateProfile(
        {
            fullName: optionalText(formData, "fullName"),
            email: optionalText(formData, "email"),
            bloodGroup: optionalText(formData, "bloodGroup") as
                | UpdateProfileDtoBloodGroup
                | undefined,
            locationId: optionalText(formData, "locationId"),
            preferredLanguage: optionalText(formData, "preferredLanguage") as
                | UpdateProfileDtoPreferredLanguage
                | undefined,
        },
        await authOptions(locale)
    )
    revalidatePath(`/${locale}/profile`)
}

export async function createRequestAction(locale: Locale, formData: FormData) {
    await requestsCreate(
        {
            patientName: text(formData, "patientName"),
            patientAge: optionalNumber(formData, "patientAge"),
            bloodGroup: text(formData, "bloodGroup") as CreateBloodRequestDtoBloodGroup,
            unitsNeeded: optionalNumber(formData, "unitsNeeded"),
            hospitalName: text(formData, "hospitalName"),
            locationId: text(formData, "locationId"),
            urgency: text(formData, "urgency") as CreateBloodRequestDtoUrgency,
            neededBy: text(formData, "neededBy"),
            notes: optionalText(formData, "notes"),
        },
        await authOptions(locale)
    )
    revalidatePath(`/${locale}/requests`)
    redirect(`/${locale}/requests`)
}

export async function updateRequestAction(
    locale: Locale,
    id: string,
    formData: FormData
) {
    await requestsUpdate(
        id,
        {
            patientName: optionalText(formData, "patientName"),
            patientAge: optionalNumber(formData, "patientAge"),
            unitsNeeded: optionalNumber(formData, "unitsNeeded"),
            hospitalName: optionalText(formData, "hospitalName"),
            urgency: optionalText(formData, "urgency") as
                | UpdateBloodRequestDtoUrgency
                | undefined,
            neededBy: optionalText(formData, "neededBy"),
            notes: optionalText(formData, "notes"),
        },
        await authOptions(locale)
    )
    revalidatePath(`/${locale}/requests/${id}`)
}

export async function cancelRequestAction(locale: Locale, id: string) {
    await requestsCancel(id, await authOptions(locale))
    revalidatePath(`/${locale}/requests`)
    revalidatePath(`/${locale}/requests/${id}`)
}

export async function confirmRecipientCompletionAction(
    locale: Locale,
    id: string,
    formData: FormData
) {
    await requestsConfirmCompletion(
        id,
        { donorId: optionalText(formData, "donorId") },
        await authOptions(locale)
    )
    revalidatePath(`/${locale}/requests/${id}`)
}

export async function registerDonorAction(locale: Locale, formData: FormData) {
    await donorsRegister(
        {
            bloodGroup: text(formData, "bloodGroup") as RegisterDonorDtoBloodGroup,
            locationId: optionalText(formData, "locationId"),
            lastDonationDate: optionalText(formData, "lastDonationDate"),
            notes: optionalText(formData, "notes"),
        },
        await authOptions(locale)
    )
    revalidatePath(`/${locale}/donor/profile`)
    redirect(`/${locale}/donor/profile`)
}

export async function updateDonorProfileAction(
    locale: Locale,
    formData: FormData
) {
    await donorsUpdateProfile(
        {
            bloodGroup: optionalText(formData, "bloodGroup") as
                | UpdateDonorProfileDtoBloodGroup
                | undefined,
            lastDonationDate: optionalText(formData, "lastDonationDate"),
            notes: optionalText(formData, "notes"),
        },
        await authOptions(locale)
    )
    revalidatePath(`/${locale}/donor/profile`)
}

export async function updateAvailabilityAction(
    locale: Locale,
    formData: FormData
) {
    await donorsUpdateAvailability(
        { isAvailable: boolValue(formData, "isAvailable") },
        await authOptions(locale)
    )
    revalidatePath(`/${locale}/donor/profile`)
}

export async function donorAcceptRequestAction(locale: Locale, id: string) {
    await donorsAcceptRequest(id, await authOptions(locale))
    revalidatePath(`/${locale}/donor/requests`)
}

export async function donorDeclineRequestAction(locale: Locale, id: string) {
    await donorsDeclineRequest(id, await authOptions(locale))
    revalidatePath(`/${locale}/donor/requests`)
}

export async function confirmDonorCompletionAction(
    locale: Locale,
    id: string,
    formData: FormData
) {
    await donorsConfirmCompletion(
        id,
        { units: optionalNumber(formData, "units") },
        await authOptions(locale)
    )
    revalidatePath(`/${locale}/donor/donations`)
}

export async function markNotificationReadAction(locale: Locale, id: string) {
    await notificationsMarkRead(id, await authOptions(locale))
    revalidatePath(`/${locale}/notifications`)
}

export async function markAllNotificationsReadAction(locale: Locale) {
    await notificationsMarkAllRead(await authOptions(locale))
    revalidatePath(`/${locale}/notifications`)
}

export async function updateUserStatusAction(
    locale: Locale,
    id: string,
    formData: FormData
) {
    await adminUpdateUserStatus(
        id,
        { status: text(formData, "status") as UpdateUserStatusDtoStatus },
        await authOptions(locale)
    )
    revalidatePath(`/${locale}/admin/users`)
}

export async function verifyDonorAction(
    locale: Locale,
    id: string,
    formData: FormData
) {
    await adminVerifyDonor(
        id,
        { verification: text(formData, "verification") as VerifyDonorDtoVerification },
        await authOptions(locale)
    )
    revalidatePath(`/${locale}/admin/donors`)
}

export async function publishRequestAction(locale: Locale, id: string) {
    await adminPublishRequest(id, await authOptions(locale))
    revalidatePath(`/${locale}/admin/requests`)
}

export async function rejectRequestAction(locale: Locale, id: string) {
    await adminRejectRequest(id, await authOptions(locale))
    revalidatePath(`/${locale}/admin/requests`)
}

export async function assignDonorAction(
    locale: Locale,
    id: string,
    formData: FormData
) {
    await adminAssignDonor(
        id,
        { donorId: text(formData, "donorId") },
        await authOptions(locale)
    )
    revalidatePath(`/${locale}/admin/requests`)
}

export async function closeRequestAction(
    locale: Locale,
    id: string,
    formData: FormData
) {
    await adminCloseRequest(
        id,
        { status: text(formData, "status") as CloseRequestDtoStatus },
        await authOptions(locale)
    )
    revalidatePath(`/${locale}/admin/requests`)
}

export async function updateSettingsAction(locale: Locale, formData: FormData) {
    await adminUpdateSettings(
        { donorCooldownDays: optionalNumber(formData, "donorCooldownDays") },
        await authOptions(locale)
    )
    revalidatePath(`/${locale}/admin/settings`)
}

export async function createAnnouncementAction(
    locale: Locale,
    formData: FormData
) {
    await adminCreateAnnouncement(
        {
            title: text(formData, "title"),
            body: text(formData, "body"),
            isPublished: boolValue(formData, "isPublished"),
        },
        await authOptions(locale)
    )
    revalidatePath(`/${locale}/admin/announcements`)
}

export async function updateAnnouncementAction(
    locale: Locale,
    id: string,
    formData: FormData
) {
    await adminUpdateAnnouncement(
        id,
        {
            title: optionalText(formData, "title"),
            body: optionalText(formData, "body"),
            isPublished: boolValue(formData, "isPublished"),
        },
        await authOptions(locale)
    )
    revalidatePath(`/${locale}/admin/announcements`)
}

export async function deleteAnnouncementAction(locale: Locale, id: string) {
    await adminDeleteAnnouncement(id, await authOptions(locale))
    revalidatePath(`/${locale}/admin/announcements`)
}
