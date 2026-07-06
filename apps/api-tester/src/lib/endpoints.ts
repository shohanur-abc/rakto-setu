// ---------------------------------------------------------------------------
// Endpoint catalog — the single source of truth the whole UI is generated from.
//
// The tester is deliberately DATA-DRIVEN: adding, removing, or tweaking an
// endpoint means editing this list only — no new components or pages. Every
// entry mirrors an endpoint from docs/02-api-specification.md.
//
// `path` uses `:param` placeholders; declare each one in `pathParams` so the
// UI renders an input for it. `body` is a JSON template pre-filled with the
// example values from the server DTOs, so most requests are one click away.
// ---------------------------------------------------------------------------
import type { HttpMethod } from "@/lib/http"

export type Access = "public" | "private" | "recipient" | "donor" | "admin"

export interface QueryParamDef {
    name: string
    example?: string
    description?: string
}

export interface EndpointDef {
    /** Number from the API spec, for cross-referencing. */
    id: number
    method: HttpMethod
    /** Path relative to /api/v1, may contain :params. */
    path: string
    title: string
    access: Access
    pathParams?: string[]
    query?: QueryParamDef[]
    /** JSON body template (objects/arrays only). Undefined => no body. */
    body?: Record<string, unknown>
    /** Capture `data.token` from the response into the auth store. */
    captureToken?: boolean
    /** Clears the auth store on success (logout). */
    clearsToken?: boolean
}

export interface EndpointGroup {
    name: string
    endpoints: EndpointDef[]
}

// A common example UUID reused across templates so testing is copy-paste free.
const EXAMPLE_ID = "f45f84c9-2685-4c17-bf6d-86de9879a33a"

export const endpointGroups: EndpointGroup[] = [
    {
        name: "Auth & Users",
        endpoints: [
            {
                id: 1,
                method: "POST",
                path: "/auth/register",
                title: "Register account",
                access: "public",
                body: {
                    fullName: "Md Rahim Uddin",
                    phone: "+8801712345678",
                    email: "rahim@example.com",
                    password: "StrongPass123!",
                    bloodGroup: "O+",
                    preferredLanguage: "en",
                },
            },
            {
                id: 2,
                method: "POST",
                path: "/auth/login",
                title: "Login (captures token)",
                access: "public",
                captureToken: true,
                body: { phone: "+8801712345678", password: "StrongPass123!" },
            },
            {
                id: 3,
                method: "POST",
                path: "/auth/logout",
                title: "Logout (clears token)",
                access: "private",
                clearsToken: true,
                body: { allSessions: false },
            },
            {
                id: 4,
                method: "POST",
                path: "/auth/otp/request",
                title: "Request OTP",
                access: "public",
                body: { phone: "+8801712345678" },
            },
            {
                id: 5,
                method: "POST",
                path: "/auth/otp/verify",
                title: "Verify OTP",
                access: "public",
                body: { phone: "+8801712345678", code: "123456" },
            },
            {
                id: 6,
                method: "POST",
                path: "/auth/password/forgot",
                title: "Forgot password",
                access: "public",
                body: { phone: "+8801712345678" },
            },
            {
                id: 7,
                method: "POST",
                path: "/auth/password/reset",
                title: "Reset password",
                access: "public",
                body: {
                    phone: "+8801712345678",
                    code: "123456",
                    newPassword: "NewStrongPass123!",
                },
            },
            {
                id: 8,
                method: "POST",
                path: "/auth/password/change",
                title: "Change password",
                access: "private",
                body: {
                    currentPassword: "StrongPass123!",
                    newPassword: "NewStrongPass123!",
                },
            },
            {
                id: 9,
                method: "GET",
                path: "/auth/me",
                title: "Current user",
                access: "private",
            },
            {
                id: 10,
                method: "GET",
                path: "/users/profile",
                title: "Get own profile",
                access: "private",
            },
            {
                id: 11,
                method: "PUT",
                path: "/users/profile",
                title: "Update own profile",
                access: "private",
                body: {
                    fullName: "Md Rahim Uddin",
                    email: "rahim@example.com",
                    bloodGroup: "O+",
                    preferredLanguage: "en",
                },
            },
            {
                id: 12,
                method: "POST",
                path: "/users/profile/avatar",
                title: "Upload avatar (JSON stub)",
                access: "private",
                body: { avatarUrl: "https://example.com/avatar.png" },
            },
        ],
    },
    {
        name: "Public Search & Info",
        endpoints: [
            {
                id: 13,
                method: "GET",
                path: "/search/donors",
                title: "Search donors",
                access: "public",
                query: [
                    { name: "bloodGroup", example: "O+" },
                    { name: "locationId", example: "" },
                    { name: "page", example: "1" },
                    { name: "limit", example: "20" },
                ],
            },
            {
                id: 14,
                method: "GET",
                path: "/search/availability-summary",
                title: "Availability summary",
                access: "public",
                query: [{ name: "locationId", example: "" }],
            },
            {
                id: 15,
                method: "GET",
                path: "/requests/public",
                title: "Browse public requests",
                access: "public",
                query: [
                    { name: "bloodGroup", example: "" },
                    { name: "locationId", example: "" },
                    { name: "urgency", example: "" },
                    { name: "page", example: "1" },
                    { name: "limit", example: "20" },
                ],
            },
            {
                id: 16,
                method: "GET",
                path: "/requests/public/:id",
                title: "View public request",
                access: "public",
                pathParams: ["id"],
            },
            {
                id: 17,
                method: "GET",
                path: "/info/faqs",
                title: "FAQs",
                access: "public",
            },
            {
                id: 18,
                method: "GET",
                path: "/info/compatibility",
                title: "Compatibility chart",
                access: "public",
            },
            {
                id: 19,
                method: "GET",
                path: "/info/eligibility",
                title: "Eligibility criteria",
                access: "public",
            },
            {
                id: 20,
                method: "GET",
                path: "/locations",
                title: "List locations",
                access: "public",
            },
            {
                id: 21,
                method: "GET",
                path: "/announcements/public",
                title: "Public announcements",
                access: "public",
            },
        ],
    },
    {
        name: "Requests (Recipient)",
        endpoints: [
            {
                id: 22,
                method: "POST",
                path: "/requests",
                title: "Create request",
                access: "recipient",
                body: {
                    patientName: "Ayesha Khatun",
                    patientAge: 42,
                    bloodGroup: "B+",
                    unitsNeeded: 1,
                    hospitalName: "Pabna General Hospital",
                    locationId: EXAMPLE_ID,
                    urgency: "urgent",
                    neededBy: "2026-08-15T10:00:00.000Z",
                    notes: "Doctor requested donor before surgery.",
                },
            },
            {
                id: 23,
                method: "GET",
                path: "/requests",
                title: "List own requests",
                access: "recipient",
                query: [
                    { name: "page", example: "1" },
                    { name: "limit", example: "20" },
                ],
            },
            {
                id: 24,
                method: "GET",
                path: "/requests/:id",
                title: "View own request",
                access: "recipient",
                pathParams: ["id"],
            },
            {
                id: 25,
                method: "PUT",
                path: "/requests/:id",
                title: "Edit own request",
                access: "recipient",
                pathParams: ["id"],
                body: {
                    hospitalName: "Pabna General Hospital",
                    urgency: "emergency",
                    notes: "Updated ward information.",
                },
            },
            {
                id: 26,
                method: "POST",
                path: "/requests/:id/cancel",
                title: "Cancel own request",
                access: "recipient",
                pathParams: ["id"],
            },
            {
                id: 27,
                method: "GET",
                path: "/requests/:id/status",
                title: "Track status",
                access: "recipient",
                pathParams: ["id"],
            },
            {
                id: 28,
                method: "GET",
                path: "/requests/:id/matches",
                title: "View matched donors",
                access: "recipient",
                pathParams: ["id"],
            },
            {
                id: 29,
                method: "POST",
                path: "/requests/:id/confirm-completion",
                title: "Confirm completion",
                access: "recipient",
                pathParams: ["id"],
                body: { donorId: EXAMPLE_ID },
            },
        ],
    },
    {
        name: "Donor",
        endpoints: [
            {
                id: 30,
                method: "POST",
                path: "/donors/register",
                title: "Register as donor",
                access: "private",
                body: {
                    bloodGroup: "O+",
                    locationId: EXAMPLE_ID,
                    lastDonationDate: "2026-01-10",
                    notes: "Prefers evening calls",
                },
            },
            {
                id: 31,
                method: "GET",
                path: "/donors/profile",
                title: "Get donor profile",
                access: "donor",
            },
            {
                id: 32,
                method: "PUT",
                path: "/donors/profile",
                title: "Update donor profile",
                access: "donor",
                body: {
                    bloodGroup: "A+",
                    lastDonationDate: "2026-01-10",
                    notes: "Avoid late-night calls",
                },
            },
            {
                id: 33,
                method: "PATCH",
                path: "/donors/availability",
                title: "Toggle availability",
                access: "donor",
                body: { isAvailable: true },
            },
            {
                id: 34,
                method: "GET",
                path: "/donors/requests",
                title: "Nearby open requests",
                access: "donor",
                query: [{ name: "locationId", example: "" }],
            },
            {
                id: 35,
                method: "POST",
                path: "/donors/requests/:id/accept",
                title: "Accept request",
                access: "donor",
                pathParams: ["id"],
            },
            {
                id: 36,
                method: "POST",
                path: "/donors/requests/:id/decline",
                title: "Decline request",
                access: "donor",
                pathParams: ["id"],
            },
            {
                id: 37,
                method: "POST",
                path: "/donors/requests/:id/confirm-completion",
                title: "Confirm completion",
                access: "donor",
                pathParams: ["id"],
                body: { units: 1 },
            },
            {
                id: 38,
                method: "GET",
                path: "/donors/donations",
                title: "Donation history",
                access: "donor",
            },
            {
                id: 39,
                method: "GET",
                path: "/donors/eligibility",
                title: "Eligibility status",
                access: "donor",
            },
        ],
    },
    {
        name: "Notifications",
        endpoints: [
            {
                id: 40,
                method: "GET",
                path: "/notifications",
                title: "List notifications",
                access: "private",
                query: [
                    { name: "page", example: "1" },
                    { name: "limit", example: "20" },
                ],
            },
            {
                id: 41,
                method: "PATCH",
                path: "/notifications/:id/read",
                title: "Mark read",
                access: "private",
                pathParams: ["id"],
            },
            {
                id: 42,
                method: "PATCH",
                path: "/notifications/read-all",
                title: "Mark all read",
                access: "private",
            },
            {
                id: 43,
                method: "GET",
                path: "/notifications/unread-count",
                title: "Unread count",
                access: "private",
            },
        ],
    },
    {
        name: "Admin",
        endpoints: [
            {
                id: 44,
                method: "GET",
                path: "/admin/dashboard",
                title: "Dashboard metrics",
                access: "admin",
            },
            {
                id: 45,
                method: "GET",
                path: "/admin/users",
                title: "List users",
                access: "admin",
                query: [
                    { name: "search", example: "" },
                    { name: "page", example: "1" },
                    { name: "limit", example: "20" },
                ],
            },
            {
                id: 46,
                method: "GET",
                path: "/admin/users/:id",
                title: "View user",
                access: "admin",
                pathParams: ["id"],
            },
            {
                id: 47,
                method: "PATCH",
                path: "/admin/users/:id/status",
                title: "Update user status",
                access: "admin",
                pathParams: ["id"],
                body: { status: "suspended" },
            },
            {
                id: 48,
                method: "DELETE",
                path: "/admin/users/:id",
                title: "Delete user",
                access: "admin",
                pathParams: ["id"],
            },
            {
                id: 49,
                method: "GET",
                path: "/admin/donors/pending",
                title: "Pending donors",
                access: "admin",
                query: [
                    { name: "page", example: "1" },
                    { name: "limit", example: "20" },
                ],
            },
            {
                id: 50,
                method: "PATCH",
                path: "/admin/donors/:id/verify",
                title: "Verify donor",
                access: "admin",
                pathParams: ["id"],
                body: { verification: "verified" },
            },
            {
                id: 51,
                method: "GET",
                path: "/admin/requests",
                title: "List all requests",
                access: "admin",
                query: [
                    { name: "status", example: "pending_review" },
                    { name: "bloodGroup", example: "" },
                    { name: "page", example: "1" },
                    { name: "limit", example: "20" },
                ],
            },
            {
                id: 52,
                method: "PATCH",
                path: "/admin/requests/:id/publish",
                title: "Publish request",
                access: "admin",
                pathParams: ["id"],
            },
            {
                id: 53,
                method: "PATCH",
                path: "/admin/requests/:id/reject",
                title: "Reject request",
                access: "admin",
                pathParams: ["id"],
            },
            {
                id: 54,
                method: "PATCH",
                path: "/admin/requests/:id/assign",
                title: "Assign donor",
                access: "admin",
                pathParams: ["id"],
                body: { donorId: EXAMPLE_ID },
            },
            {
                id: 55,
                method: "PATCH",
                path: "/admin/requests/:id/close",
                title: "Close request",
                access: "admin",
                pathParams: ["id"],
                body: { status: "unfulfilled" },
            },
            {
                id: 56,
                method: "GET",
                path: "/admin/reports",
                title: "Reports",
                access: "admin",
                query: [
                    { name: "from", example: "2026-01-01" },
                    { name: "to", example: "2026-12-31" },
                    { name: "status", example: "" },
                ],
            },
            {
                id: 57,
                method: "GET",
                path: "/admin/reports/export",
                title: "Export report (CSV)",
                access: "admin",
                query: [
                    { name: "from", example: "2026-01-01" },
                    { name: "to", example: "2026-12-31" },
                ],
            },
            {
                id: 58,
                method: "POST",
                path: "/admin/announcements",
                title: "Create announcement",
                access: "admin",
                body: {
                    title: "Blood donation camp",
                    body: "A local donation camp will be held this Friday.",
                    isPublished: true,
                },
            },
            {
                id: 59,
                method: "PUT",
                path: "/admin/announcements/:id",
                title: "Edit announcement",
                access: "admin",
                pathParams: ["id"],
                body: {
                    title: "Updated donation camp",
                    body: "Updated details for the donation camp.",
                    isPublished: true,
                },
            },
            {
                id: 60,
                method: "DELETE",
                path: "/admin/announcements/:id",
                title: "Delete announcement",
                access: "admin",
                pathParams: ["id"],
            },
            {
                id: 61,
                method: "GET",
                path: "/admin/reports/moderation",
                title: "Moderation queue",
                access: "admin",
            },
            {
                id: 62,
                method: "GET",
                path: "/admin/settings",
                title: "Read settings",
                access: "admin",
            },
            {
                id: 63,
                method: "PUT",
                path: "/admin/settings",
                title: "Update settings",
                access: "admin",
                body: { donorCooldownDays: 90, metadata: { locale: "bn" } },
            },
        ],
    },
]

/** Flat lookup by a stable key (method + path) used for routing/selection. */
export function endpointKey(endpoint: EndpointDef): string {
    return `${endpoint.method} ${endpoint.path}`
}

export const allEndpoints: EndpointDef[] = endpointGroups.flatMap(
    (group) => group.endpoints
)
