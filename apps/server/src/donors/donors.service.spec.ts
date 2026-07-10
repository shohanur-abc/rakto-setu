import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { BloodGroup, DonorVerification, RequestStatus, RequestUrgency, ResponseStatus, Role, UserStatus } from '@prisma/client';
import { DonorsService } from './donors.service';
import { RequestCompletionService } from '@/requests/request-completion.service';
import { SettingsService } from '@/common/settings.service';
import { AuthUser } from '@/common/types/auth-user';
import { prismaMock } from '@/prisma/prisma-mock';

const now = new Date('2026-01-01T00:00:00.000Z');
const donorUserId = '11111111-1111-1111-1111-111111111111';
const locationId = '33333333-3333-3333-3333-333333333333';
const requestId = '22222222-2222-2222-2222-222222222222';

const authUser: AuthUser = {
    id: donorUserId,
    phone: '+8801712345678',
    role: Role.RECIPIENT,
    jti: 'session-id',
};

const recipientAccount = {
    id: donorUserId,
    role: Role.RECIPIENT,
    bloodGroup: BloodGroup.O_POSITIVE,
    locationId,
};

const donorUser = {
    id: donorUserId,
    fullName: 'Md Donor Uddin',
    phone: '+8801712345678',
    email: null,
    passwordHash: 'hash',
    role: Role.DONOR,
    bloodGroup: BloodGroup.O_POSITIVE,
    locationId,
    status: UserStatus.ACTIVE,
    phoneVerified: true,
    preferredLanguage: 'bn',
    createdAt: now,
    updatedAt: now,
};

const donorProfile = {
    id: '44444444-4444-4444-4444-444444444444',
    userId: donorUserId,
    bloodGroup: BloodGroup.O_POSITIVE,
    isAvailable: true,
    verification: DonorVerification.VERIFIED,
    lastDonationDate: null,
    nextEligibleDate: null,
    totalDonations: 0,
    notes: null,
    createdAt: now,
    updatedAt: now,
    user: donorUser,
};

const publishedRequest = {
    id: requestId,
    recipientId: '55555555-5555-5555-5555-555555555555',
    patientName: 'Ayesha Khatun',
    patientAge: 42,
    bloodGroup: BloodGroup.B_POSITIVE,
    unitsNeeded: 1,
    unitsFulfilled: 0,
    hospitalName: 'Pabna General Hospital',
    locationId,
    urgency: RequestUrgency.URGENT,
    neededBy: new Date('2026-08-15T10:00:00.000Z'),
    status: RequestStatus.PUBLISHED,
    notes: null,
    reviewedById: null,
    createdAt: now,
    updatedAt: now,
    recipient: {
        id: '55555555-5555-5555-5555-555555555555',
        fullName: 'Recipient User',
        phone: '+8801812345678',
        email: 'recipient@example.com',
    },
};

describe('DonorsService', () => {
    let service: DonorsService;
    let completion: RequestCompletionService;
    let settings: SettingsService;

    beforeEach(() => {
        vi.clearAllMocks();

        completion = {
            confirmDonor: vi.fn().mockResolvedValue({ confirmed: true }),
        } as unknown as RequestCompletionService;

        settings = {
            getDonorCooldownDays: vi.fn().mockResolvedValue(90),
        } as unknown as SettingsService;

        prismaMock.$transaction.mockImplementation(async (callback) => {
            return callback(prismaMock);
        });

        service = new DonorsService(
            prismaMock as never,
            completion,
            settings,
        );
    });

    it('registers a donor profile and upgrades recipient role to donor', async () => {
        prismaMock.donorProfile.findUnique.mockResolvedValue(null);
        prismaMock.user.findUnique.mockResolvedValue(recipientAccount as never);
        prismaMock.donorProfile.create.mockResolvedValue(donorProfile as never);
        prismaMock.user.update.mockResolvedValue(donorUser as never);
        prismaMock.donorProfile.findUniqueOrThrow.mockResolvedValue(
            donorProfile as never,
        );

        const result = await service.register(authUser, {
            bloodGroup: 'O+',
            locationId,
            lastDonationDate: '2026-01-01',
            notes: 'Prefers evening calls',
        });

        expect(result.bloodGroup).toBe('O+');

        expect(prismaMock.donorProfile.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    userId: authUser.id,
                    bloodGroup: BloodGroup.O_POSITIVE,
                    nextEligibleDate: expect.any(Date),
                    notes: 'Prefers evening calls',
                }),
            }),
        );

        expect(prismaMock.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: authUser.id },
                data: expect.objectContaining({
                    role: Role.DONOR,
                    bloodGroup: BloodGroup.O_POSITIVE,
                    locationId,
                }),
            }),
        );
    });

    it('uses the user profile blood group when donor registration omits bloodGroup', async () => {
        prismaMock.donorProfile.findUnique.mockResolvedValue(null);
        prismaMock.user.findUnique.mockResolvedValue(recipientAccount as never);
        prismaMock.donorProfile.create.mockResolvedValue(donorProfile as never);
        prismaMock.user.update.mockResolvedValue(donorUser as never);
        prismaMock.donorProfile.findUniqueOrThrow.mockResolvedValue(
            donorProfile as never,
        );

        const result = await service.register(authUser, {
            locationId,
            notes: 'Use profile blood group',
        });

        expect(result.bloodGroup).toBe('O+');

        expect(prismaMock.donorProfile.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    userId: authUser.id,
                    bloodGroup: BloodGroup.O_POSITIVE,
                }),
            }),
        );

        expect(prismaMock.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: authUser.id },
                data: expect.objectContaining({
                    role: Role.DONOR,
                    bloodGroup: BloodGroup.O_POSITIVE,
                    locationId,
                }),
            }),
        );
    });

    it('rejects donor registration when dto bloodGroup does not match profile bloodGroup', async () => {
        prismaMock.donorProfile.findUnique.mockResolvedValue(null);
        prismaMock.user.findUnique.mockResolvedValue(recipientAccount as never);

        await expect(
            service.register(authUser, {
                bloodGroup: 'A+',
                locationId,
            }),
        ).rejects.toBeInstanceOf(BadRequestException);

        expect(prismaMock.donorProfile.create).not.toHaveBeenCalled();
        expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('rejects donor registration when bloodGroup is missing from dto and user profile', async () => {
        prismaMock.donorProfile.findUnique.mockResolvedValue(null);
        prismaMock.user.findUnique.mockResolvedValue({
            ...recipientAccount,
            bloodGroup: null,
        } as never);

        await expect(
            service.register(authUser, {
                locationId,
            }),
        ).rejects.toBeInstanceOf(BadRequestException);

        expect(prismaMock.donorProfile.create).not.toHaveBeenCalled();
        expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('rejects duplicate donor registration', async () => {
        prismaMock.donorProfile.findUnique.mockResolvedValue(
            donorProfile as never,
        );

        await expect(
            service.register(authUser, { bloodGroup: 'O+' }),
        ).rejects.toBeInstanceOf(ConflictException);

        expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
        expect(prismaMock.donorProfile.create).not.toHaveBeenCalled();
    });

    it('reports donor eligibility when the donor has no active commitment', async () => {
        prismaMock.donorProfile.findUnique.mockResolvedValue(
            donorProfile as never,
        );
        prismaMock.requestResponse.findFirst.mockResolvedValue(null);

        const result = await service.getEligibility(authUser);

        expect(result).toMatchObject({
            eligible: true,
            isAvailable: true,
            verification: 'verified',
            hasActiveCommitment: false,
            nextEligibleDate: null,
        });
        expect(prismaMock.requestResponse.findFirst).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    donorId: authUser.id,
                    status: ResponseStatus.ACCEPTED,
                    request: {
                        status: {
                            in: [
                                RequestStatus.PUBLISHED,
                                RequestStatus.MATCHED,
                                RequestStatus.IN_PROGRESS,
                            ],
                        },
                    },
                },
            }),
        );
    });

    it('marks donor ineligible when they already have an active commitment', async () => {
        prismaMock.donorProfile.findUnique.mockResolvedValue(
            donorProfile as never,
        );
        prismaMock.requestResponse.findFirst.mockResolvedValue({
            requestId,
        } as never);

        const result = await service.getEligibility(authUser);

        expect(result).toMatchObject({
            eligible: false,
            hasActiveCommitment: true,
        });
    });

    it('accepts a compatible published request and notifies the recipient', async () => {
        prismaMock.donorProfile.findUnique.mockResolvedValue(
            donorProfile as never,
        );
        prismaMock.requestResponse.findFirst.mockResolvedValue(null);
        prismaMock.bloodRequest.findUnique.mockResolvedValue(
            publishedRequest as never,
        );
        prismaMock.requestResponse.upsert.mockResolvedValue({} as never);
        prismaMock.bloodRequest.update.mockResolvedValue({
            ...publishedRequest,
            status: RequestStatus.MATCHED,
        } as never);
        prismaMock.notification.create.mockResolvedValue({} as never);

        const result = await service.acceptRequest(authUser, requestId);

        expect(result.accepted).toBe(true);
        expect(result.request.recipientContact.phone).toBe('+8801812345678');

        expect(prismaMock.requestResponse.upsert).toHaveBeenCalledWith(
            expect.objectContaining({
                create: expect.objectContaining({
                    requestId,
                    donorId: authUser.id,
                    status: ResponseStatus.ACCEPTED,
                }),
            }),
        );

        expect(prismaMock.notification.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    userId: publishedRequest.recipientId,
                    referenceId: requestId,
                }),
            }),
        );
    });

    it('blocks donors from accepting another request while one is active', async () => {
        prismaMock.donorProfile.findUnique.mockResolvedValue(
            donorProfile as never,
        );
        prismaMock.requestResponse.findFirst.mockResolvedValue({
            requestId,
        } as never);

        await expect(
            service.acceptRequest(authUser, requestId),
        ).rejects.toBeInstanceOf(BadRequestException);

        expect(prismaMock.requestResponse.findFirst).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    donorId: authUser.id,
                    status: ResponseStatus.ACCEPTED,
                    request: {
                        status: {
                            in: [
                                RequestStatus.PUBLISHED,
                                RequestStatus.MATCHED,
                                RequestStatus.IN_PROGRESS,
                            ],
                        },
                    },
                },
            }),
        );
        expect(prismaMock.bloodRequest.findUnique).not.toHaveBeenCalled();
        expect(prismaMock.requestResponse.upsert).not.toHaveBeenCalled();
    });

    it('lets a donor cancel their accepted request and reopens the request', async () => {
        prismaMock.donorProfile.findUnique.mockResolvedValue(
            donorProfile as never,
        );
        prismaMock.requestResponse.findUnique.mockResolvedValue({
            id: '66666666-6666-6666-6666-666666666666',
            requestId,
            donorId: authUser.id,
            status: ResponseStatus.ACCEPTED,
            respondedAt: now,
            donorConfirmedCompletion: false,
            recipientConfirmedCompletion: false,
            cancelledAt: null,
            cancelledBy: null,
            cancelReason: null,
            createdAt: now,
            updatedAt: now,
            request: {
                ...publishedRequest,
                status: RequestStatus.MATCHED,
            },
        } as never);
        prismaMock.requestResponse.update.mockResolvedValue({
            id: '66666666-6666-6666-6666-666666666666',
            requestId,
            donorId: authUser.id,
            status: ResponseStatus.WITHDRAWN,
            respondedAt: now,
            donorConfirmedCompletion: false,
            recipientConfirmedCompletion: false,
            cancelledAt: now,
            cancelledBy: authUser.id,
            cancelReason: 'No longer available',
            createdAt: now,
            updatedAt: now,
        } as never);
        prismaMock.requestResponse.count.mockResolvedValue(0);
        prismaMock.bloodRequest.findUnique.mockResolvedValue({
            status: RequestStatus.MATCHED,
            unitsFulfilled: 0,
            unitsNeeded: 1,
        } as never);
        prismaMock.bloodRequest.update.mockResolvedValue({} as never);

        const result = await service.cancelAcceptedRequest(authUser, requestId, {
            cancelReason: 'No longer available',
        });

        expect(result).toMatchObject({
            cancelled: true,
            status: 'withdrawn',
        });
        expect(prismaMock.requestResponse.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    status: ResponseStatus.WITHDRAWN,
                    cancelledBy: authUser.id,
                    cancelReason: 'No longer available',
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

    it('lists accepted requests with recipient contact details for the donor', async () => {
        prismaMock.requestResponse.findMany.mockResolvedValue([
            {
                id: '66666666-6666-6666-6666-666666666666',
                requestId,
                donorId: authUser.id,
                status: ResponseStatus.ACCEPTED,
                respondedAt: now,
                donorConfirmedCompletion: false,
                recipientConfirmedCompletion: false,
                createdAt: now,
                updatedAt: now,
                request: {
                    ...publishedRequest,
                    status: RequestStatus.MATCHED,
                    location: {
                        id: locationId,
                        name: 'Pabna Sadar',
                        type: 'UPAZILA',
                        parentId: null,
                        createdAt: now,
                        updatedAt: now,
                    },
                },
            },
        ] as never);

        const result = await service.getAcceptedRequests(authUser);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            requestId,
            patientName: 'Ayesha Khatun',
            bloodGroup: 'B+',
            status: 'matched',
            responseStatus: 'accepted',
            recipientContact: {
                fullName: 'Recipient User',
                phone: '+8801812345678',
                email: 'recipient@example.com',
            },
        });

        expect(prismaMock.requestResponse.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    donorId: authUser.id,
                    status: ResponseStatus.ACCEPTED,
                },
                orderBy: { respondedAt: 'desc' },
            }),
        );
    });

    it('blocks unverified donors from accepting requests', async () => {
        prismaMock.donorProfile.findUnique.mockResolvedValue({
            ...donorProfile,
            verification: DonorVerification.UNVERIFIED,
        } as never);

        await expect(
            service.acceptRequest(authUser, requestId),
        ).rejects.toBeInstanceOf(BadRequestException);

        expect(prismaMock.bloodRequest.findUnique).not.toHaveBeenCalled();
    });
});
