import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import {
    DonorVerification,
    NotificationType,
    RequestStatus,
    ResponseStatus,
    Role,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RequestCompletionService } from '../requests/request-completion.service';
import { SettingsService } from '../common/settings.service';
import { AuthUser } from '../common/types/auth-user';
import {
    parseBloodGroup,
    toBloodGroupLabel,
    compatibleRecipientGroupsForDonor,
} from '../common/utils/blood-group';
import {
    toDonorVerificationLabel,
    toRequestStatusLabel,
    toRequestUrgencyLabel,
} from '../common/utils/api-enums';
import { addDays } from '../common/utils/date';
import {
    ConfirmDonorCompletionDto,
    DonorRequestsQueryDto,
    RegisterDonorDto,
    UpdateAvailabilityDto,
    UpdateDonorProfileDto,
} from './dto/donor.dto';

@Injectable()
export class DonorsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly completion: RequestCompletionService,
        private readonly settings: SettingsService,
    ) { }


    // ---------------- Register Donor ----------------

    async register(user: AuthUser, dto: RegisterDonorDto) {
        const existing = await this.prisma.donorProfile.findUnique({
            where: { userId: user.id },
        });

        if (existing) {
            throw new ConflictException('Donor profile already exists');
        }

        const lastDonationDate = dto.lastDonationDate
            ? new Date(dto.lastDonationDate)
            : null;
        const cooldownDays = await this.settings.getDonorCooldownDays();
        const bloodGroup = parseBloodGroup(dto.bloodGroup);

        const profile = await this.prisma.donorProfile.create({
            data: {
                userId: user.id,
                bloodGroup,
                lastDonationDate,
                nextEligibleDate: lastDonationDate
                    ? addDays(lastDonationDate, cooldownDays)
                    : null,
                notes: dto.notes,
            },
            include: { user: true },
        });

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                role: user.role === Role.ADMIN ? Role.ADMIN : Role.DONOR,
                bloodGroup,
                locationId: dto.locationId,
            },
        });

        return this.toDonorProfileView(profile);
    }


    // ---------------- Get Profile ----------------

    async getProfile(user: AuthUser) {
        return this.toDonorProfileView(await this.findProfile(user.id));
    }


    // ---------------- Update Profile ----------------

    async updateProfile(user: AuthUser, dto: UpdateDonorProfileDto) {
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

    async updateAvailability(user: AuthUser, dto: UpdateAvailabilityDto) {
        const profile = await this.prisma.donorProfile.update({
            where: { userId: user.id },
            data: { isAvailable: dto.isAvailable },
            include: { user: true },
        });

        return this.toDonorProfileView(profile);
    }


    // ---------------- Matching Requests ----------------

    async getMatchingRequests(user: AuthUser, query: DonorRequestsQueryDto) {
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
        this.assertEligible(profile);

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


    // ---------------- Confirm Completion ----------------

    async confirmCompletion(
        user: AuthUser,
        requestId: string,
        dto: ConfirmDonorCompletionDto,
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

        return {
            eligible:
                profile.isAvailable &&
                profile.verification === DonorVerification.VERIFIED &&
                !cooldownActive,
            isAvailable: profile.isAvailable,
            verification: toDonorVerificationLabel(profile.verification),
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


    // ---------------- Assert Eligible ----------------

    private assertEligible(
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
