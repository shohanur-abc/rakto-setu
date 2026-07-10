import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BloodGroup, RequestStatus, RequestUrgency, ResponseStatus, Role } from '@prisma/client';
import { RequestsService } from './requests.service';
import { RequestCompletionService } from './request-completion.service';
import { AuthUser } from '@/common/types/auth-user';
import { prismaMock } from '@/prisma/prisma-mock';

const createdAt = new Date('2026-01-01T00:00:00.000Z');
const locationId = '33333333-3333-3333-3333-333333333333';
const requestId = '22222222-2222-2222-2222-222222222222';
const recipientId = '11111111-1111-1111-1111-111111111111';
const donorId = '44444444-4444-4444-4444-444444444444';

const authUser: AuthUser = {
    id: recipientId,
    phone: '+8801712345678',
    role: Role.RECIPIENT,
    jti: 'session-id',
};

const baseRequest = {
    id: requestId,
    recipientId,
    patientName: 'Ayesha Khatun',
    patientAge: 42,
    bloodGroup: BloodGroup.B_POSITIVE,
    unitsNeeded: 1,
    unitsFulfilled: 0,
    hospitalName: 'Pabna General Hospital',
    locationId,
    location: {
        id: locationId,
        name: 'Example Union',
        type: 'union',
        parentId: null,
        createdAt,
        updatedAt: createdAt,
    },
    urgency: RequestUrgency.URGENT,
    neededBy: new Date('2026-08-15T10:00:00.000Z'),
    status: RequestStatus.PUBLISHED,
    notes: null,
    reviewedById: null,
    createdAt,
    updatedAt: createdAt,
};

describe('RequestsService', () => {
    let service: RequestsService;
    let completion: RequestCompletionService;

    beforeEach(() => {
        completion = {
            confirmRecipient: vi.fn().mockResolvedValue({ confirmed: true }),
        } as unknown as RequestCompletionService;

        prismaMock.$transaction.mockImplementation(async (callback) => {
            return callback(prismaMock);
        });

        service = new RequestsService(prismaMock as never, completion);
    });

    it('creates pending-review requests and hides contact details', async () => {
        prismaMock.location.findUnique.mockResolvedValue({ id: locationId } as never);
        prismaMock.bloodRequest.create.mockResolvedValue({
            ...baseRequest,
            status: RequestStatus.PENDING_REVIEW,
        } as never);

        const result = await service.create(authUser, {
            patientName: baseRequest.patientName,
            patientAge: baseRequest.patientAge ?? undefined,
            bloodGroup: 'B+',
            hospitalName: baseRequest.hospitalName,
            locationId,
            urgency: 'urgent',
            neededBy: baseRequest.neededBy.toISOString(),
            notes: 'Doctor requested donor before surgery.',
        });

        expect(result.status).toBe('pending_review');
        expect(result).not.toHaveProperty('recipientContact');
        expect(prismaMock.bloodRequest.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    recipientId,
                    bloodGroup: BloodGroup.B_POSITIVE,
                    urgency: RequestUrgency.URGENT,
                    status: RequestStatus.PENDING_REVIEW,
                }),
            }),
        );
    });

    it('keeps public request contact details hidden', async () => {
        prismaMock.bloodRequest.findFirst.mockResolvedValue(
            baseRequest as never,
        );

        const result = await service.getPublic(requestId);

        expect(result).not.toHaveProperty('recipientContact');
        expect(result.acceptedDonors).toBeUndefined();
    });

    it('lists public requests without opening a transaction', async () => {
        prismaMock.bloodRequest.findMany.mockResolvedValue([
            baseRequest,
        ] as never);
        prismaMock.bloodRequest.count.mockResolvedValue(1);

        const result = await service.listPublic({ page: 1, limit: 10 });

        expect(result.items).toHaveLength(1);
        expect(result.meta).toEqual({
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
        });
        expect(result.items[0]).not.toHaveProperty('recipientContact');
        expect(prismaMock.$transaction).not.toHaveBeenCalled();
        expect(prismaMock.bloodRequest.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { status: RequestStatus.PUBLISHED },
                orderBy: { neededBy: 'asc' },
                skip: 0,
                take: 10,
            }),
        );
        expect(prismaMock.bloodRequest.count).toHaveBeenCalledWith({
            where: { status: RequestStatus.PUBLISHED },
        });
    });

    it('throws not found for non-published public request detail', async () => {
        prismaMock.bloodRequest.findFirst.mockResolvedValue(null);

        await expect(service.getPublic(requestId)).rejects.toBeInstanceOf(
            NotFoundException,
        );
    });

    it('shows accepted donor contact details only to the request owner', async () => {
        prismaMock.bloodRequest.findFirst.mockResolvedValue({
            ...baseRequest,
            responses: [
                {
                    donor: {
                        id: donorId,
                        fullName: 'Md Donor Uddin',
                        phone: '+8801812345678',
                        email: 'donor@example.com',
                    },
                },
            ],
        } as never);

        const result = await service.getOwn(authUser, requestId);

        expect(result.acceptedDonors).toEqual([
            {
                id: donorId,
                fullName: 'Md Donor Uddin',
                phone: '+8801812345678',
                email: 'donor@example.com',
            },
        ]);
    });

    it('blocks editing closed requests', async () => {
        prismaMock.bloodRequest.findFirst.mockResolvedValue({
            ...baseRequest,
            status: RequestStatus.FULFILLED,
        } as never);

        await expect(
            service.update(authUser, requestId, { patientName: 'Updated' }),
        ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('delegates recipient completion confirmation', async () => {
        const result = await service.confirmCompletion(authUser, requestId, {
            donorId,
        });

        expect(result).toEqual({ confirmed: true });
        expect(completion.confirmRecipient).toHaveBeenCalledWith(
            requestId,
            recipientId,
            donorId,
        );
    });

    it('lists accepted donor matches for the request owner', async () => {
        prismaMock.bloodRequest.findFirst.mockResolvedValue({ id: requestId } as never);
        prismaMock.requestResponse.findMany.mockResolvedValue([
            {
                id: '66666666-6666-6666-6666-666666666666',
                requestId,
                donorId,
                status: ResponseStatus.ACCEPTED,
                donorConfirmedCompletion: false,
                recipientConfirmedCompletion: false,
                respondedAt: createdAt,
                createdAt,
                updatedAt: createdAt,
                donor: {
                    id: donorId,
                    fullName: 'Md Donor Uddin',
                    phone: '+8801812345678',
                    email: null,
                    donorProfile: {
                        bloodGroup: BloodGroup.O_POSITIVE,
                    },
                },
            },
        ] as never);

        const result = await service.getMatches(authUser, requestId);

        expect(result[0].status).toBe('accepted');
        expect(result[0].donor.phone).toBe('+8801812345678');
        expect(result[0].donor.bloodGroup).toBe('O+');
    });

    it('lets the recipient cancel an accepted donor match and reopens the request', async () => {
        prismaMock.bloodRequest.findFirst.mockResolvedValue({
            id: requestId,
            status: RequestStatus.MATCHED,
        } as never);
        prismaMock.requestResponse.findUnique.mockResolvedValue({
            id: '66666666-6666-6666-6666-666666666666',
            requestId,
            donorId,
            status: ResponseStatus.ACCEPTED,
            respondedAt: createdAt,
            donorConfirmedCompletion: false,
            recipientConfirmedCompletion: false,
            cancelledAt: null,
            cancelledBy: null,
            cancelReason: null,
            createdAt,
            updatedAt: createdAt,
        } as never);
        prismaMock.requestResponse.update.mockResolvedValue({
            id: '66666666-6666-6666-6666-666666666666',
            requestId,
            donorId,
            status: ResponseStatus.WITHDRAWN,
            respondedAt: createdAt,
            donorConfirmedCompletion: false,
            recipientConfirmedCompletion: false,
            cancelledAt: createdAt,
            cancelledBy: recipientId,
            cancelReason: 'No longer needed',
            createdAt,
            updatedAt: createdAt,
        } as never);
        prismaMock.requestResponse.count.mockResolvedValue(0);
        prismaMock.bloodRequest.findUnique.mockResolvedValue({
            status: RequestStatus.MATCHED,
            unitsFulfilled: 0,
            unitsNeeded: 1,
        } as never);
        prismaMock.bloodRequest.update.mockResolvedValue({} as never);

        const result = await service.cancelMatch(authUser, requestId, donorId, {
            cancelReason: 'No longer needed',
        });

        expect(result).toMatchObject({
            cancelled: true,
            status: 'withdrawn',
        });
        expect(prismaMock.requestResponse.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    status: ResponseStatus.WITHDRAWN,
                    cancelledBy: recipientId,
                    cancelReason: 'No longer needed',
                }),
            }),
        );
        expect(prismaMock.bloodRequest.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: requestId },
                data: { status: RequestStatus.PUBLISHED },
            }),
        );
    });
});
