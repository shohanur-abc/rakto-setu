import type { UserViewDto } from "@/lib/api/generated/rakto-setu"

// The API serialises Prisma enums by their JS member name, so `role` and
// `status` arrive UPPERCASE (e.g. "RECIPIENT", "ACTIVE") even though the
// generated client types them as lowercase literals. Normalise on ingest so
// role checks (isAdmin/isDonor/isRecipient) and status comparisons are
// reliable everywhere downstream. This is the single choke point where a raw
// user object enters the app state.
export function normalizeUser(user: UserViewDto): UserViewDto {
    return {
        ...user,
        role: String(user.role).toLowerCase() as UserViewDto["role"],
        status: String(user.status).toLowerCase() as UserViewDto["status"],
    }
}
