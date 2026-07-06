// Small presentation helpers shared across pages. Kept dependency-free.

/** Format an ISO date string as a readable date (e.g. "15 Aug 2026"). */
export function formatDate(value?: string | null): string {
    if (!value) return "—"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "—"
    return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
    })
}

/** Format an ISO string as date + time. */
export function formatDateTime(value?: string | null): string {
    if (!value) return "—"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "—"
    return date.toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

/** Relative time like "3h ago" / "in 2d", falling back to a date. */
export function formatRelative(value?: string | null): string {
    if (!value) return "—"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "—"

    const diffMs = date.getTime() - Date.now()
    const abs = Math.abs(diffMs)
    const minute = 60_000
    const hour = 60 * minute
    const day = 24 * hour

    if (abs < minute) return "just now"
    const fmt = (n: number, unit: string) =>
        diffMs < 0 ? `${n}${unit} ago` : `in ${n}${unit}`
    if (abs < hour) return fmt(Math.round(abs / minute), "m")
    if (abs < day) return fmt(Math.round(abs / hour), "h")
    if (abs < 30 * day) return fmt(Math.round(abs / day), "d")
    return formatDate(value)
}

/** Turn "pending_review" into "Pending review". */
export function humanizeLabel(value?: string | null): string {
    if (!value) return "—"
    const spaced = value.replace(/[_-]+/g, " ")
    return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

/** Two-letter initials from a name, for avatars. */
export function initialsOf(name?: string | null): string {
    if (!name) return "U"
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("")
}
