import { beforeEach, describe, expect, it } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { NotificationType, Role } from '@prisma/client';
import { NotificationsService } from './notifications.service';
import { AuthUser } from '../common/types/auth-user';
import { prismaMock } from '../../test/prisma-mock';

const user: AuthUser = {
    id: '11111111-1111-1111-1111-111111111111',
    phone: '+8801712345678',
    role: Role.RECIPIENT,
    jti: 'session-id',
};
const createdAt = new Date('2026-01-01T00:00:00.000Z');
const notification = {
    id: '22222222-2222-2222-2222-222222222222',
    userId: user.id,
    type: NotificationType.STATUS_UPDATE,
    title: 'Status update',
    body: 'Your request changed.',
    referenceId: null,
    isRead: false,
    channel: 'in_app',
    createdAt,
};

describe('NotificationsService', () => {
    let service: NotificationsService;

    beforeEach(() => {
        service = new NotificationsService(prismaMock as never);
    });

    it('lists notifications for the current user only', async () => {
        prismaMock.notification.findMany.mockResolvedValue([notification] as never);

        const result = await service.list(user);

        expect(result).toEqual([notification]);
        expect(prismaMock.notification.findMany).toHaveBeenCalledWith({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        });
    });

    it('marks an owned notification as read', async () => {
        prismaMock.notification.findFirst.mockResolvedValue(notification as never);
        prismaMock.notification.update.mockResolvedValue({
            ...notification,
            isRead: true,
        } as never);

        const result = await service.markRead(user, notification.id);

        expect(result.isRead).toBe(true);
        expect(prismaMock.notification.update).toHaveBeenCalledWith({
            where: { id: notification.id },
            data: { isRead: true },
        });
    });

    it('throws not found when marking another user notification', async () => {
        prismaMock.notification.findFirst.mockResolvedValue(null);

        await expect(
            service.markRead(user, notification.id),
        ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('marks all unread notifications and returns count', async () => {
        prismaMock.notification.updateMany.mockResolvedValue({ count: 3 } as never);

        await expect(service.markAllRead(user)).resolves.toEqual({ updated: 3 });
    });

    it('returns unread notification count', async () => {
        prismaMock.notification.count.mockResolvedValue(5);

        await expect(service.unreadCount(user)).resolves.toEqual({ count: 5 });
    });
});
