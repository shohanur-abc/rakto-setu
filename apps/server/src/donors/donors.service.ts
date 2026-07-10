import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DonorVerification, NotificationType, Prisma, RequestStatus, ResponseStatus, Role } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { RequestCompletionService } from '@/requests/request-completion.service';
import { SettingsService } from '@/common/settings.service';
import { AuthUser } from '@/common/types/auth-user';
import { parseBloodGroup, toBloodGroupLabel, compatibleRecipientGroupsForDonor } from '@/common/utils/blood-group';
import { toDonorVerificationLabel, toRequestStatusLabel, toRequestUrgencyLabel, toResponseStatusLabel } from '@/common/utils/api-enums';
import { addDays } from '@/common/utils/date';
import { CancelDonorAcceptedRequestRequest } from './donors.dto';
import { ConfirmDonorCompletionRequest } from './donors.dto';
import { MatchingRequestsRequest } from './donors.dto';
import { RegisterDonorRequest } from './donors.dto';
import { UpdateAvailabilityRequest } from './donors.dto';
import { UpdateDonorProfileRequest } from './donors.dto';

const activeCommitmentStatuses = [
    RequestStatus.PUBLISHED,
    RequestStatus.MATCHED,
    RequestStatus.IN_PROGRESS,
];

@Injectable()
export class DonorsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly completion: RequestCompletionService,
        private readonly settings: SettingsService,
    ) { }


    // ---------------- Register Donor ----------------

    async register(user: AuthUser, dto: RegisterDonorRequest) {
        const existing = await this.prisma.donorProfile.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });

        if (existing) {
            throw new ConflictException('Donor profile already exists');
        }

        const account = await this.prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                role: true,
                bloodGroup: true,
                locationId: true,
            },
        });

        if (!account) {
            throw new BadRequestException('User account not found');
        }

        const dtoBloodGroup = dto.bloodGroup
            ? parseBloodGroup(dto.bloodGroup)
            : null;

        if (dtoBloodGroup && account.bloodGroup && dtoBloodGroup !== account.bloodGroup) {
            throw new BadRequestException(
                'Blood group does not match your profile. Please update your profile first.',
            );
        }

        const bloodGroup = dtoBloodGroup ?? account.bloodGroup;

        if (!bloodGroup) {
            throw new BadRequestException(
                'Blood group is required to register as a donor',
            );
        }

        const lastDonationDate = dto.lastDonationDate
            ? new Date(dto.lastDonationDate)
            : null;

        const cooldownDays = await this.settings.getDonorCooldownDays();

        const profile = await this.prisma.$transaction(async (tx) => {
            await tx.donorProfile.create({
                data: {
                    userId: user.id,
                    bloodGroup,
                    lastDonationDate,
                    nextEligibleDate: lastDonationDate
                        ? addDays(lastDonationDate, cooldownDays)
                        : null,
                    notes: dto.notes,
                },
            });

            await tx.user.update({
                where: { id: user.id },
                data: {
                    role: account.role === Role.ADMIN ? Role.ADMIN : Role.DONOR,
                    bloodGroup,
                    locationId: dto.locationId ?? undefined,
                },
            });

            return tx.donorProfile.findUniqueOrThrow({
                where: { userId: user.id },
                include: { user: true },
            });
        });

        return this.toDonorProfileView(profile);
    }

    // ---------------- Get Profile ----------------

    async getProfile(user: AuthUser) {
        return this.toDonorProfileView(await this.findProfile(user.id));
    }


    // ---------------- Update Profile ----------------

    async updateProfile(user: AuthUser, dto: UpdateDonorProfileRequest) {
        await this.findProfile(user.id);

        const lastDonationDate = dto.lastDonationDate
            ? new Date(dto.lastDonationDate)
            : undefined;
        const cooldownDays = await this.settings.getDonorCooldownDays();
        const bloodGroup = dto.bloodGroup
            ? parseBloodGroup(dto.bloodGroup)
            : undefined;

        const profile = await this.prisma.donorProfile.update({
            where: { userId: user.id },
            data: {
                bloodGroup,
                lastDonationDate,
                nextEligibleDate: lastDonationDate
                    ? addDays(lastDonationDate, cooldownDays)
                    : undefined,
                notes: dto.notes,
            },
            include: { user: true },
        });

        if (bloodGroup) {
            await this.prisma.user.update({
                where: { id: user.id },
                data: { bloodGroup },
            });
        }

        return this.toDonorProfileView(profile);
    }


    // ---------------- Update Availability ----------------

    async updateAvailability(user: AuthUser, dto: UpdateAvailabilityRequest) {
        const profile = await this.prisma.donorProfile.update({
            where: { userId: user.id },
            data: { isAvailable: dto.isAvailable },
            include: { user: true },
        });

        return this.toDonorProfileView(profile);
    }


    // ---------------- Matching Requests ----------------

    async getMatchingRequests(user: AuthUser, query: MatchingRequestsRequest) {
        const profile = await this.findProfile(user.id);
        const recipientGroups = compatibleRecipientGroupsForDonor(
            profile.bloodGroup,
        );

        const requests = await this.prisma.bloodRequest.findMany({
            where: {
                status: RequestStatus.PUBLISHED,
                bloodGroup: { in: recipientGroups },
                ...(query.locationId || profile.user.locationId
                    ? {
                        locationId:
                            query.locationId ??
                            profile.user.locationId ??
                            undefined,
                    }
                    : {}),
                responses: {
                    none: {
                        donorId: user.id,
                        status: ResponseStatus.DECLINED,
                    },
                },
            },
            include: { location: true },
            orderBy: [{ urgency: 'desc' }, { neededBy: 'asc' }],
        });

        return requests.map((request) => ({
            id: request.id,
            patientName: request.patientName,
            bloodGroup: toBloodGroupLabel(request.bloodGroup),
            unitsNeeded: request.unitsNeeded,
            hospitalName: request.hospitalName,
            location: request.location,
            urgency: toRequestUrgencyLabel(request.urgency),
            neededBy: request.neededBy,
            status: toRequestStatusLabel(request.status),
        }));
    }


    // ---------------- Accept Request ----------------

    async acceptRequest(user: AuthUser, requestId: string) {
        const profile = await this.findProfile(user.id);
        await this.assertCanAcceptRequest(profile);

        const request = await this.prisma.bloodRequest.findUnique({
            where: { id: requestId },
            include: { recipient: true },
        });

        if (!request || request.status !== RequestStatus.PUBLISHED) {
            throw new NotFoundException('Open blood request was not found');
        }

        if (
            !compatibleRecipientGroupsForDonor(profile.bloodGroup).includes(
                request.bloodGroup,
            )
        ) {
            throw new BadRequestException(
                'Donor blood group is not compatible',
            );
        }

        await this.prisma.requestResponse.upsert({
            where: { requestId_donorId: { requestId, donorId: user.id } },
            create: {
                requestId,
                donorId: user.id,
                status: ResponseStatus.ACCEPTED,
            },
            update: {
                status: ResponseStatus.ACCEPTED,
                respondedAt: new Date(),
            },
        });

        const updatedRequest = await this.prisma.bloodRequest.update({
            where: { id: requestId },
            data: { status: RequestStatus.MATCHED },
            include: { recipient: true },
        });

        await this.prisma.notification.create({
            data: {
                userId: request.recipientId,
                type: NotificationType.DONOR_RESPONSE,
                title: 'Donor accepted your request',
                body: `${profile.user.fullName} accepted your blood request.`,
                referenceId: requestId,
            },
        });

        return {
            accepted: true,
            request: {
                id: updatedRequest.id,
                patientName: updatedRequest.patientName,
                recipientContact: {
                    fullName: updatedRequest.recipient.fullName,
                    phone: updatedRequest.recipient.phone,
                    email: updatedRequest.recipient.email,
                },
            },
        };
    }


    // ---------------- Accepted Requests ----------------

    async getAcceptedRequests(user: AuthUser) {
        const responses = await this.prisma.requestResponse.findMany({
            where: {
                donorId: user.id,
                status: ResponseStatus.ACCEPTED,
            },
            include: {
                request: {
                    include: {
                        recipient: true,
                        location: true,
                    },
                },
            },
            orderBy: { respondedAt: 'desc' },
        });

        return responses.map((response) => ({
            id: response.id,
            requestId: response.requestId,
            patientName: response.request.patientName,
            bloodGroup: toBloodGroupLabel(response.request.bloodGroup),
            unitsNeeded: response.request.unitsNeeded,
            unitsFulfilled: response.request.unitsFulfilled,
            hospitalName: response.request.hospitalName,
            location: response.request.location,
            urgency: toRequestUrgencyLabel(response.request.urgency),
            neededBy: response.request.neededBy,
            status: toRequestStatusLabel(response.request.status),
            responseStatus: toResponseStatusLabel(response.status),
            respondedAt: response.respondedAt,
            donorConfirmedCompletion: response.donorConfirmedCompletion,
            recipientConfirmedCompletion: response.recipientConfirmedCompletion,
            recipientContact: {
                fullName: response.request.recipient.fullName,
                phone: response.request.recipient.phone,
                email: response.request.recipient.email,
            },
        }));
    }


    // ---------------- Decline Request ----------------

    async declineRequest(user: AuthUser, requestId: string) {
        await this.findProfile(user.id);

        await this.prisma.requestResponse.upsert({
            where: { requestId_donorId: { requestId, donorId: user.id } },
            create: {
                requestId,
                donorId: user.id,
                status: ResponseStatus.DECLINED,
            },
            update: {
                status: ResponseStatus.DECLINED,
                respondedAt: new Date(),
            },
        });

        return { declined: true };
    }


    // ---------------- Cancel Accepted Request ----------------

    async cancelAcceptedRequest(
        user: AuthUser,
        requestId: string,
        dto: CancelDonorAcceptedRequestRequest,
    ) {
        await this.findProfile(user.id);

        const now = new Date();
        const response = await this.prisma.$transaction(async (tx) => {
            const existing = await tx.requestResponse.findUnique({
                where: { requestId_donorId: { requestId, donorId: user.id } },
                include: { request: true },
            });

            if (!existing || existing.status !== ResponseStatus.ACCEPTED) {
                throw new NotFoundException(
                    'Accepted donor response was not found',
                );
            }

            if (
                existing.donorConfirmedCompletion ||
                existing.recipientConfirmedCompletion
            ) {
                throw new BadRequestException(
                    'Completion has already been confirmed for this response',
                );
            }

            if (
                existing.request.status === RequestStatus.FULFILLED ||
                existing.request.status === RequestStatus.CANCELLED ||
                existing.request.status === RequestStatus.EXPIRED ||
                existing.request.status === RequestStatus.UNFULFILLED
            ) {
                throw new BadRequestException('Request is already closed');
            }

            const updated = await tx.requestResponse.update({
                where: { requestId_donorId: { requestId, donorId: user.id } },
                data: {
                    status: ResponseStatus.WITHDRAWN,
                    cancelledAt: now,
                    cancelledBy: user.id,
                    cancelReason: dto.cancelReason,
                },
            });

            await this.reopenRequestIfNoAcceptedResponses(tx, requestId);

            return updated;
        });

        return {
            cancelled: true,
            status: toResponseStatusLabel(response.status),
            cancelledAt: response.cancelledAt ?? now,
        };
    }


    // ---------------- Confirm Completion ----------------

    async confirmCompletion(
        user: AuthUser,
        requestId: string,
        dto: ConfirmDonorCompletionRequest,
    ) {
        return this.completion.confirmDonor(requestId, user.id, dto.units ?? 1);
    }


    // ---------------- Donation History ----------------

    async getDonations(user: AuthUser) {
        const donations = await this.prisma.donation.findMany({
            where: { donorProfile: { userId: user.id } },
            include: { request: true },
            orderBy: { createdAt: 'desc' },
        });

        return donations.map((donation) => ({
            id: donation.id,
            donationDate: donation.donationDate,
            units: donation.units,
            requestId: donation.requestId,
            patientName: donation.request?.patientName ?? null,
            createdAt: donation.createdAt,
        }));
    }


    // ---------------- Eligibility ----------------

    async getEligibility(user: AuthUser) {
        const profile = await this.findProfile(user.id);
        const nextEligibleDate = profile.nextEligibleDate;
        const cooldownActive = nextEligibleDate
            ? nextEligibleDate > new Date()
            : false;
        const activeCommitment = await this.findActiveCommitment(profile.userId);

        return {
            eligible:
                profile.isAvailable &&
                profile.verification === DonorVerification.VERIFIED &&
                !cooldownActive &&
                !activeCommitment,
            isAvailable: profile.isAvailable,
            verification: toDonorVerificationLabel(profile.verification),
            hasActiveCommitment: Boolean(activeCommitment),
            nextEligibleDate,
        };
    }


    // ---------------- Find Profile ----------------

    private async findProfile(userId: string) {
        const profile = await this.prisma.donorProfile.findUnique({
            where: { userId },
            include: { user: true },
        });

        if (!profile) {
            throw new NotFoundException('Donor profile was not found');
        }

        return profile;
    }


    // ---------------- Assert Can Accept Request ----------------

    private async assertCanAcceptRequest(
        profile: Awaited<ReturnType<DonorsService['findProfile']>>,
    ) {
        if (!profile.isAvailable) {
            throw new BadRequestException('Donor is currently unavailable');
        }

        if (profile.verification !== DonorVerification.VERIFIED) {
            throw new BadRequestException(
                'Donor must be verified before accepting requests',
            );
        }

        if (profile.nextEligibleDate && profile.nextEligibleDate > new Date()) {
            throw new BadRequestException('Donor is still in cooldown period');
        }

        const activeResponse = await this.findActiveCommitment(profile.userId);

        if (activeResponse) {
            throw new BadRequestException(
                'Donor already has an active accepted request',
            );
        }
    }


    // ---------------- Find Active Commitment ----------------

    private async findActiveCommitment(donorId: string) {
        return this.prisma.requestResponse.findFirst({
            where: {
                donorId,
                status: ResponseStatus.ACCEPTED,
                request: {
                    status: { in: activeCommitmentStatuses },
                },
            },
            select: {
                requestId: true,
            },
        });
    }


    // ---------------- Reopen Request ----------------

    private async reopenRequestIfNoAcceptedResponses(
        tx: Prisma.TransactionClient,
        requestId: string,
    ) {
        const acceptedResponses = await tx.requestResponse.count({
            where: {
                requestId,
                status: ResponseStatus.ACCEPTED,
            },
        });

        if (acceptedResponses > 0) {
            return;
        }

        const request = await tx.bloodRequest.findUnique({
            where: { id: requestId },
            select: {
                status: true,
                unitsFulfilled: true,
                unitsNeeded: true,
            },
        });

        if (
            !request ||
            request.status === RequestStatus.FULFILLED ||
            request.status === RequestStatus.CANCELLED ||
            request.status === RequestStatus.EXPIRED ||
            request.status === RequestStatus.UNFULFILLED
        ) {
            return;
        }

        await tx.bloodRequest.update({
            where: { id: requestId },
            data: {
                status:
                    request.unitsFulfilled > 0 &&
                        request.unitsFulfilled < request.unitsNeeded
                        ? RequestStatus.IN_PROGRESS
                        : RequestStatus.PUBLISHED,
            },
        });
    }


    // ---------------- Profile View ----------------

    private toDonorProfileView(
        profile: Awaited<ReturnType<DonorsService['findProfile']>>,
    ) {
        return {
            id: profile.id,
            userId: profile.userId,
            fullName: profile.user.fullName,
            phone: profile.user.phone,
            bloodGroup: toBloodGroupLabel(profile.bloodGroup),
            isAvailable: profile.isAvailable,
            verification: toDonorVerificationLabel(profile.verification),
            lastDonationDate: profile.lastDonationDate,
            nextEligibleDate: profile.nextEligibleDate,
            totalDonations: profile.totalDonations,
            notes: profile.notes,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        };
    }
}
