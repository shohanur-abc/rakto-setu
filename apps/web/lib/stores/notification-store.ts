import { create } from "zustand"

// ===================== Types =====================

interface NotificationState {
    unreadCount: number
    setUnreadCount: (count: number) => void
    increment: () => void
    decrement: () => void
    reset: () => void
}

// ===================== Store =====================

export const useNotificationStore = create<NotificationState>((set) => ({
    unreadCount: 0,

    setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),

    increment: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),

    decrement: () => set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),

    reset: () => set({ unreadCount: 0 }),
}))
