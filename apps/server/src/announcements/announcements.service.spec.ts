import { beforeEach, describe, expect, it } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AnnouncementsService } from './announcements.service';
import { AuthUser } from '../common/types/auth-user';
import { prismaMock } from '../../test/prisma-mock';

const createdAt = new Date('2026-01-01T00:00:00.000Z');
const admin: AuthUser = {
    id: '11111111-1111-1111-1111-111111111111',
    phone: '+8801712345678',
    role: Role.ADMIN,
    jti: 'session-id',
};
const announcement = {
    id: '22222222-2222-2222-2222-222222222222',
    authorId: admin.id,
    title: 'Blood donation camp',
    body: 'A local donation camp will be held this Friday.',
    isPublished: true,
    createdAt,
    updatedAt: createdAt,
};

describe('AnnouncementsService', () => {
    let service: AnnouncementsService;

    beforeEach(() => {
        service = new AnnouncementsService(prismaMock as never);
    });

    it('lists only published announcements', async () => {
        prismaMock.announcement.findMany.mockResolvedValue([announcement] as never);

        const result = await service.listPublic();

        expect(result).toEqual([announcement]);
        expect(prismaMock.announcement.findMany).toHaveBeenCalledWith({
            where: { isPublished: true },
            orderBy: { createdAt: 'desc' },
        });
    });

    it('creates published announcements by default', async () => {
        prismaMock.announcement.create.mockResolvedValue(announcement as never);

        await service.create(admin, {
            title: announcement.title,
            body: announcement.body,
        });

        expect(prismaMock.announcement.create).toHaveBeenCalledWith({
            data: {
                authorId: admin.id,
                title: announcement.title,
                body: announcement.body,
                isPublished: true,
            },
        });
    });

    it('updates an existing announcement', async () => {
        prismaMock.announcement.findUnique.mockResolvedValue({
            id: announcement.id,
        } as never);
        prismaMock.announcement.update.mockResolvedValue({
            ...announcement,
            title: 'Updated camp',
        } as never);

        const result = await service.update(announcement.id, {
            title: 'Updated camp',
        });

        expect(result.title).toBe('Updated camp');
    });

    it('throws not found before updating a missing announcement', async () => {
        prismaMock.announcement.findUnique.mockResolvedValue(null);

        await expect(
            service.update(announcement.id, { title: 'Updated camp' }),
        ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('deletes an existing announcement', async () => {
        prismaMock.announcement.findUnique.mockResolvedValue({
            id: announcement.id,
        } as never);
        prismaMock.announcement.delete.mockResolvedValue(announcement as never);

        await expect(service.delete(announcement.id)).resolves.toEqual({
            deleted: true,
        });
    });
});
