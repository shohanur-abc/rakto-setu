import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { RequestStatus, ResponseStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../common/settings.service';
import { addDays } from '../common/utils/date';

@Injectable()
export class RequestCompletionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly settings: SettingsService,
    ) { }


    // ---------------- Confirm Donor ----------------

    async confirmDonor(requestId: string, donorId: string, units = 1) {
        const response = await this.prisma.requestResponse.update({
            where: { requestId_donorId: { requestId, donorId } },
            data: { donorConfirmedCompletion: true },
        });

        await this.finalizeIfReady(response.requestId, response.donorId, units);

        return { confirmed: true };
    }


    // ---------------- Confirm Recipient ----------------

    async confirmRecipient(
        requestId: string,
        recipientId: string,
        donorId?: string,
    ) {
        const request = await this.prisma.bloodRequest.findFirst({
            where: { id: requestId, recipientId },
            include: {
                responses: {
                    where: {
                        status: ResponseStatus.ACCEPTED,
                        ...(donorId ? { donorId } : {}),
                    },
                    orderBy: { respondedAt: 'asc' },
                },
            },
        });

        if (!request) {
            throw new NotFoundException('Blood request was not found');
        }

        const response = request.responses.at(0);

        if (!response) {
            throw new BadRequestException(
                'No accepted donor response to confirm',
            );
        }

        await this.prisma.requestResponse.update({
            where: {
                requestId_donorId: {
                    requestId,
                    donorId: response.donorId,
                },
            },
            data: { recipientConfirmedCompletion: true },
        });

        await this.finalizeIfReady(requestId, response.donorId);

        return { confirmed: true };
    }


    // ---------------- Finalize Donation ----------------

    private async finalizeIfReady(
        requestId: string,
        donorId: string,
        units = 1,
    ) {
        const response = await this.prisma.requestResponse.findUnique({
            where: { requestId_donorId: { requestId, donorId } },
            include: {
                request: true,
                donor: {
                    include: { donorProfile: true },
                },
            },
        });

        if (
            !response?.donorConfirmedCompletion ||
            !response.recipientConfirmedCompletion
        ) {
            return;
        }

        const donorProfile = response.donor.donorProfile;

        if (!donorProfile) {
            throw new BadRequestException('Donor profile was not found');
        }

        const donationDate = new Date();
        const cooldownDays = await this.settings.getDonorCooldownDays();

        await this.prisma.$transaction(async (tx) => {
            const existingDonation = await tx.donation.findFirst({
                where: {
                    donorProfileId: donorProfile.id,
                    requestId,
                },
            });

            if (existingDonation) {
                return;
            }

            await tx.donation.create({
                data: {
                    donorProfileId: donorProfile.id,
                    requestId,
                    donationDate,
                    units,
                    recipientConfirmed: true,
                },
            });

            const fulfilledUnits = Math.min(
                response.request.unitsNeeded,
                response.request.unitsFulfilled + units,
            );

            await tx.donorProfile.update({
                where: { id: donorProfile.id },
                data: {
                    lastDonationDate: donationDate,
                    nextEligibleDate: addDays(donationDate, cooldownDays),
                    totalDonations: { increment: 1 },
                    isAvailable: false,
                },
            });

            await tx.bloodRequest.update({
                where: { id: requestId },
                data: {
                    unitsFulfilled: fulfilledUnits,
                    status:
                        fulfilledUnits >= response.request.unitsNeeded
                            ? RequestStatus.FULFILLED
                            : RequestStatus.IN_PROGRESS,
                },
            });
        });
    }
}
