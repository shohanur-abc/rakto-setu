import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { BloodGroup, DonorVerification, RequestStatus, Role, UserStatus } from '@prisma/client';
import { AdminService } from './admin.service';
import { AnnouncementsService } from '@/announcements/announcements.service';
import { AuditService } from '@/audit/audit.service';
import { SettingsService } from '@/common/settings.service';
import { AuthUser } from '@/common/types/auth-user';
import { RequestsService } from '@/requests/requests.service';
import { prismaMock } from '@/prisma/prisma-mock';

const createdAt = new Date('2026-01-01T00:00:00.000Z');
const actor: AuthUser = {
    id: '11111111-1111-1111-1111-111111111111',
    phone: '+8801712345678',
    role: Role.ADMIN,
    jti: 'session-id',
};
const user = {
    id: '22222222-2222-2222-2222-222222222222',
    fullName: 'Md User Uddin',
    phone: '+8801812345678',
    email: null,
    passwordHash: 'hash',
    role: Role.RECIPIENT,
    bloodGroup: BloodGroup.B_POSITIVE,
    locationId: null,
    status: UserStatus.ACTIVE,
    phoneVerified: true,
    preferredLanguage: 'bn',
    createdAt,
    updatedAt: createdAt,
};

const mockTransaction = () =>
    prismaMock.$transaction as unknown as {
        mockResolvedValue: (value: unknown) => void;
    };

describe('AdminService', () => {
    let service: AdminService;
    let audit: AuditService;
    let requests: RequestsService;
    let announcements: AnnouncementsService;
    let settings: SettingsService;

    beforeEach(() => {
        audit = {
            record: vi.fn().mockResolvedValue({}),
        } as unknown as AuditService;
        requests = {
            listAdmin: vi.fn().mockResolvedValue({ items: [], meta: {} }),
        } as unknown as RequestsService;
        announcements = {
            create: vi.fn().mockResolvedValue({ id: 'announcement-id' }),
            update: vi.fn().mockResolvedValue({ id: 'announcement-id' }),
            delete: vi.fn().mockResolvedValue({ deleted: true }),
        } as unknown as AnnouncementsService;
        settings = {
            getPublicSettings: vi.fn().mockResolvedValue({ donorCooldownDays: 90 }),
            updateSettings: vi.fn().mockResolvedValue({ donorCooldownDays: 120 }),
        } as unknown as SettingsService;

        service = new AdminService(
            prismaMock as never,
            audit,
            requests,
            announcements,
            settings,
        );
    });

    it('returns dashboard metrics from one transaction', async () => {
        mockTransaction().mockResolvedValue([10, 4, 2, 3, 5, 1]);

        await expect(service.dashboard()).resolves.toEqual({
            users: 10,
            activeDonors: 4,
            pendingDonors: 2,
            pendingRequests: 3,
            publishedRequests: 5,
            fulfilledRequests: 1,
        });
    });

    it('updates user status and records an audit log', async () => {
        prismaMock.user.update.mockResolvedValue({
            ...user,
            status: UserStatus.SUSPENDED,
        } as never);

        const result = await service.updateUserStatus(actor, user.id, {
            status: 'suspended',
        });

        expect(result.status).toBe('suspended');
        expect(prismaMock.user.update).toHaveBeenCalledWith({
            where: { id: user.id },
            data: { status: UserStatus.SUSPENDED },
        });
        expect(audit.record).toHaveBeenCalledWith(
            expect.objectContaining({
                actorId: actor.id,
                action: 'user.status_update',
                entityType: 'user',
                entityId: user.id,
            }),
        );
    });

    it('publishes a request and notifies the recipient', async () => {
        prismaMock.bloodRequest.update.mockResolvedValue({
            id: '33333333-3333-3333-3333-333333333333',
            recipientId: user.id,
            status: RequestStatus.PUBLISHED,
        } as never);
        prismaMock.notification.create.mockResolvedValue({} as never);

        const result = await service.publishRequest(
            actor,
            '33333333-3333-3333-3333-333333333333',
        );

        expect(result.status).toBe('published');
        expect(audit.record).toHaveBeenCalledWith(
            expect.objectContaining({ action: 'request.publish' }),
        );
        expect(prismaMock.notification.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ userId: user.id }),
            }),
        );
    });

    it('throws not found while assigning a missing request or donor', async () => {
        prismaMock.bloodRequest.findUnique.mockResolvedValue(null);
        prismaMock.donorProfile.findUnique.mockResolvedValue(null);

        await expect(
            service.assignDonor(
                actor,
                '33333333-3333-3333-3333-333333333333',
                { donorId: '44444444-4444-4444-4444-444444444444' },
            ),
        ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('lists pending donors using public enum labels', async () => {
        prismaMock.donorProfile.findMany.mockResolvedValue([
            {
                id: '44444444-4444-4444-4444-444444444444',
                userId: user.id,
                bloodGroup: BloodGroup.B_POSITIVE,
                verification: DonorVerification.UNVERIFIED,
                createdAt,
                user,
            },
        ] as never);

        const result = await service.pendingDonors();

        expect(result[0]).toEqual(
            expect.objectContaining({
                fullName: user.fullName,
                bloodGroup: 'B+',
                verification: 'unverified',
            }),
        );
    });

    it('delegates request listing to RequestsService', async () => {
        const query = { status: 'published', page: 1, limit: 20 };

        await service.listRequests(query);

        expect(requests.listAdmin).toHaveBeenCalledWith(query);
    });
});
