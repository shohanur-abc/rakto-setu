import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { BloodGroup, RequestStatus, ResponseStatus } from '@prisma/client';
import { RequestCompletionService } from './request-completion.service';
import { SettingsService } from '../common/settings.service';
import { prismaMock } from '../../test/prisma-mock';

const requestId = '22222222-2222-2222-2222-222222222222';
const donorId = '11111111-1111-1111-1111-111111111111';
const recipientId = '33333333-3333-3333-3333-333333333333';

const mockTransaction = () =>
    prismaMock.$transaction as unknown as {
        mockImplementation: (
            implementation: (callback: (tx: never) => unknown) => unknown,
        ) => void;
    };

describe('RequestCompletionService', () => {
    let service: RequestCompletionService;
    let settings: SettingsService;

    beforeEach(() => {
        settings = {
            getDonorCooldownDays: vi.fn().mockResolvedValue(90),
        } as unknown as SettingsService;
        service = new RequestCompletionService(prismaMock as never, settings);
    });

    it('rejects recipient confirmation when no accepted donor exists', async () => {
        prismaMock.bloodRequest.findFirst.mockResolvedValue({
            id: requestId,
            recipientId,
            responses: [],
        } as never);

        await expect(
            service.confirmRecipient(requestId, recipientId),
        ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('finalizes donation after both donor and recipient confirm completion', async () => {
        const donorProfile = {
            id: '44444444-4444-4444-4444-444444444444',
            userId: donorId,
            bloodGroup: BloodGroup.O_POSITIVE,
        };
        const tx = {
            donation: {
                findFirst: vi.fn().mockResolvedValue(null),
                create: vi.fn().mockResolvedValue({}),
            },
            donorProfile: {
                update: vi.fn().mockResolvedValue({}),
            },
            bloodRequest: {
                update: vi.fn().mockResolvedValue({}),
            },
        };

        prismaMock.requestResponse.update.mockResolvedValue({
            requestId,
            donorId,
        } as never);
        prismaMock.requestResponse.findUnique.mockResolvedValue({
            requestId,
            donorId,
            status: ResponseStatus.ACCEPTED,
            donorConfirmedCompletion: true,
            recipientConfirmedCompletion: true,
            request: {
                id: requestId,
                unitsNeeded: 2,
                unitsFulfilled: 1,
            },
            donor: {
                id: donorId,
                donorProfile,
            },
        } as never);
        mockTransaction().mockImplementation(async (callback) => callback(tx as never));

        const result = await service.confirmDonor(requestId, donorId, 1);

        expect(result).toEqual({ confirmed: true });
        expect(tx.donation.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    donorProfileId: donorProfile.id,
                    requestId,
                    units: 1,
                    recipientConfirmed: true,
                }),
            }),
        );
        expect(tx.bloodRequest.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: requestId },
                data: expect.objectContaining({
                    unitsFulfilled: 2,
                    status: RequestStatus.FULFILLED,
                }),
            }),
        );
    });
});
