import { beforeEach, describe, expect, it } from 'vitest';
import { BloodGroup, DonorVerification } from '@prisma/client';
import { SearchService } from './search.service';
import { prismaMock } from '../../test/prisma-mock';

const mockTransaction = () =>
    prismaMock.$transaction as unknown as {
        mockResolvedValue: (value: unknown) => void;
    };

describe('SearchService', () => {
    let service: SearchService;

    beforeEach(() => {
        service = new SearchService(prismaMock as never);
    });

    it('searches compatible available verified donors without exposing contact details', async () => {
        const profile = {
            id: '22222222-2222-2222-2222-222222222222',
            userId: '11111111-1111-1111-1111-111111111111',
            bloodGroup: BloodGroup.O_POSITIVE,
            isAvailable: true,
            verification: DonorVerification.VERIFIED,
            nextEligibleDate: null,
            totalDonations: 4,
            user: {
                id: '11111111-1111-1111-1111-111111111111',
                fullName: 'Md Donor Uddin',
                locationId: '33333333-3333-3333-3333-333333333333',
            },
        };
        mockTransaction().mockResolvedValue([[profile], 1]);

        const result = await service.searchDonors({
            bloodGroup: 'B+',
            page: 1,
            limit: 10,
        });

        expect(result.items[0]).toEqual({
            id: profile.id,
            userId: profile.userId,
            fullName: profile.user.fullName,
            bloodGroup: 'O+',
            locationId: profile.user.locationId,
            totalDonations: 4,
            nextEligibleDate: null,
        });
        expect(result.items[0]).not.toHaveProperty('phone');
        expect(prismaMock.donorProfile.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    isAvailable: true,
                    verification: DonorVerification.VERIFIED,
                    bloodGroup: expect.objectContaining({
                        in: expect.arrayContaining([
                            BloodGroup.B_POSITIVE,
                            BloodGroup.O_POSITIVE,
                        ]),
                    }),
                }),
            }),
        );
    });

    it('summarizes available donors by blood group', async () => {
        prismaMock.donorProfile.groupBy.mockResolvedValue([
            {
                bloodGroup: BloodGroup.O_POSITIVE,
                _count: { _all: 3 },
            },
        ] as never);

        const result = await service.availabilitySummary({});

        expect(result).toEqual([
            {
                bloodGroup: 'O+',
                availableDonors: 3,
            },
        ]);
    });
});
