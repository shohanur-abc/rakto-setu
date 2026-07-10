import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuthUser } from '@/common/types/auth-user';

@Injectable()
export class NotificationsService {
    constructor(private readonly prisma: PrismaService) { }


    // ---------------- List Notifications ----------------

    async list(user: AuthUser) {
        return this.prisma.notification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        });
    }


    // ---------------- Mark Read ----------------

    async markRead(user: AuthUser, id: string) {
        const notification = await this.prisma.notification.findFirst({
            where: { id, userId: user.id },
        });

        if (!notification) {
            throw new NotFoundException('Notification was not found');
        }

        return this.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
    }


    // ---------------- Mark All Read ----------------

    async markAllRead(user: AuthUser) {
        const result = await this.prisma.notification.updateMany({
            where: { userId: user.id, isRead: false },
            data: { isRead: true },
        });

        return { updated: result.count };
    }


    // ---------------- Unread Count ----------------

    async unreadCount(user: AuthUser) {
        const count = await this.prisma.notification.count({
            where: { userId: user.id, isRead: false },
        });

        return { count };
    }
}
