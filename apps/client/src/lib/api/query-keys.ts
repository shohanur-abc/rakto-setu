// Central React Query key registry. Keeping keys in one place avoids typos and
// makes cache invalidation after mutations explicit and greppable.
export const queryKeys = {
    auth: {
        me: ["auth", "me"] as const,
    },
    profile: {
        me: ["profile"] as const,
    },
    requests: {
        own: (params?: unknown) => ["requests", "own", params ?? null] as const,
        detail: (id: string) => ["requests", "detail", id] as const,
        status: (id: string) => ["requests", "status", id] as const,
        matches: (id: string) => ["requests", "matches", id] as const,
    },
    donor: {
        profile: ["donor", "profile"] as const,
        eligibility: ["donor", "eligibility"] as const,
        donations: ["donor", "donations"] as const,
        matching: (params?: unknown) =>
            ["donor", "matching", params ?? null] as const,
    },
    notifications: {
        list: ["notifications", "list"] as const,
        unread: ["notifications", "unread"] as const,
    },
    admin: {
        dashboard: ["admin", "dashboard"] as const,
        users: (params?: unknown) => ["admin", "users", params ?? null] as const,
        user: (id: string) => ["admin", "user", id] as const,
        pendingDonors: ["admin", "donors", "pending"] as const,
        requests: (params?: unknown) =>
            ["admin", "requests", params ?? null] as const,
        reports: (params?: unknown) =>
            ["admin", "reports", params ?? null] as const,
        moderation: ["admin", "moderation"] as const,
        settings: ["admin", "settings"] as const,
    },
} as const
