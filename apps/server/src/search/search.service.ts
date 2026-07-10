import { Injectable } from '@nestjs/common';
import { DonorVerification } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { compatibleDonorGroupsForRecipient, parseBloodGroup, toBloodGroupLabel } from '@/common/utils/blood-group';
import { getPagination, makePage } from '@/common/utils/pagination';
import { AvailabilitySummaryRequest } from './search.dto';
import { SearchDonorsRequest } from './search.dto';

@Injectable()
export class SearchService {
    constructor(private readonly prisma: PrismaService) { }


    // ---------------- Search Donors ----------------

    async searchDonors(query: SearchDonorsRequest) {
        const recipientGroup = parseBloodGroup(query.bloodGroup);
        const compatibleGroups =
            compatibleDonorGroupsForRecipient(recipientGroup);
        const page = getPagination(query);
        const now = new Date();
        const where = {
            bloodGroup: { in: compatibleGroups },
            isAvailable: true,
            verification: DonorVerification.VERIFIED,
            OR: [
                { nextEligibleDate: null },
                { nextEligibleDate: { lte: now } },
            ],
            ...(query.locationId
                ? { user: { locationId: query.locationId } }
                : {}),
        };

        const [items, total] = await this.prisma.$transaction([
            this.prisma.donorProfile.findMany({
                where,
                include: {
                    user: {
                        select: { id: true, fullName: true, locationId: true },
                    },
                },
                orderBy: { totalDonations: 'desc' },
                skip: page.skip,
                take: page.take,
            }),
            this.prisma.donorProfile.count({ where }),
        ]);

        return makePage(
            items.map((profile) => ({
                id: profile.id,
                userId: profile.userId,
                fullName: profile.user.fullName,
                bloodGroup: toBloodGroupLabel(profile.bloodGroup),
                locationId: profile.user.locationId,
                totalDonations: profile.totalDonations,
                nextEligibleDate: profile.nextEligibleDate,
            })),
            total,
            query,
        );
    }


    // ---------------- Availability Summary ----------------

    async availabilitySummary(query: AvailabilitySummaryRequest) {
        const now = new Date();
        const rows = await this.prisma.donorProfile.groupBy({
            by: ['bloodGroup'],
            where: {
                isAvailable: true,
                verification: DonorVerification.VERIFIED,
                OR: [
                    { nextEligibleDate: null },
                    { nextEligibleDate: { lte: now } },
                ],
                ...(query.locationId
                    ? { user: { locationId: query.locationId } }
                    : {}),
            },
            _count: { _all: true },
        });

        return rows.map((row) => ({
            bloodGroup: toBloodGroupLabel(row.bloodGroup),
            availableDonors: row._count._all,
        }));
    }
}
