import { Injectable, NotFoundException } from '@nestjs/common';
import {
    DonorVerification,
    NotificationType,
    RequestStatus,
    ResponseStatus,
    UserStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AnnouncementsService } from '../announcements/announcements.service';
import {
    CreateAnnouncementDto,
    UpdateAnnouncementDto,
} from '../announcements/dto/announcement.dto';
import { AuditService } from '../audit/audit.service';
import { SettingsService } from '../common/settings.service';
import { AuthUser } from '../common/types/auth-user';
import {
    parseDonorVerification,
    parseRequestStatus,
    parseUserStatus,
    toDonorVerificationLabel,
    toRequestStatusLabel,
} from '../common/utils/api-enums';
import { toBloodGroupLabel } from '../common/utils/blood-group';
import { toCsv } from '../common/utils/csv';
import { getPagination, makePage } from '../common/utils/pagination';
import { RequestsService } from '../requests/requests.service';
import { AdminRequestQueryDto } from '../requests/dto/request.dto';
import {
    AdminUserQueryDto,
    AssignDonorDto,
    CloseRequestDto,
    ReportsQueryDto,
    UpdateSettingsDto,
    UpdateUserStatusDto,
    VerifyDonorDto,
} from './dto/admin.dto';
import { toUserView } from '../users/user.presenter';

@Injectable()
export class AdminService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly audit: AuditService,
        private readonly requests: RequestsService,
        private readonly announcements: AnnouncementsService,
        private readonly settings: SettingsService,
    ) { }


    // ---------------- Dashboard ----------------

    async dashboard() {
        const [
            users,
            activeDonors,
            pendingDonors,
            pendingRequests,
            publishedRequests,
            fulfilledRequests,
        ] = await this.prisma.$transaction([
            this.prisma.user.count({
                where: { status: { not: UserStatus.DELETED } },
            }),
            this.prisma.donorProfile.count({
                where: {
                    verification: DonorVerification.VERIFIED,
                    isAvailable: true,
                },
            }),
            this.prisma.donorProfile.count({
                where: { verification: DonorVerification.UNVERIFIED },
            }),
            this.prisma.bloodRequest.count({
                where: { status: RequestStatus.PENDING_REVIEW },
            }),
            this.prisma.bloodRequest.count({
                where: { status: RequestStatus.PUBLISHED },
            }),
            this.prisma.bloodRequest.count({
                where: { status: RequestStatus.FULFILLED },
            }),
        ]);

        return {
            users,
            activeDonors,
            pendingDonors,
            pendingRequests,
            publishedRequests,
            fulfilledRequests,
        };
    }


    // ---------------- List Users ----------------

    async listUsers(query: AdminUserQueryDto) {
        const page = getPagination(query);
        const where = query.search
            ? {
                OR: [
                    {
                        fullName: {
                            contains: query.search,
                            mode: 'insensitive' as const,
                        },
                    },
                    { phone: { contains: query.search } },
                    {
                        email: {
                            contains: query.search,
                            mode: 'insensitive' as const,
                        },
                    },
                ],
            }
            : {};

        const [items, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: page.skip,
                take: page.take,
            }),
            this.prisma.user.count({ where }),
        ]);

        return makePage(items.map(toUserView), total, query);
    }


    // ---------------- Get User ----------------

    async getUser(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { donorProfile: true },
        });

        if (!user) {
            throw new NotFoundException('User was not found');
        }

        return {
            ...toUserView(user),
            donorProfile: user.donorProfile
                ? {
                    id: user.donorProfile.id,
                    bloodGroup: toBloodGroupLabel(
                        user.donorProfile.bloodGroup,
                    ),
                    isAvailable: user.donorProfile.isAvailable,
                    verification: toDonorVerificationLabel(
                        user.donorProfile.verification,
                    ),
                    totalDonations: user.donorProfile.totalDonations,
                }
                : null,
        };
    }


    // ---------------- Update User ----------------

    async updateUserStatus(
        actor: AuthUser,
        id: string,
        dto: UpdateUserStatusDto,
    ) {
        const user = await this.prisma.user.update({
            where: { id },
            data: { status: parseUserStatus(dto.status) },
        });

        await this.audit.record({
            actorId: actor.id,
            action: 'user.status_update',
            entityType: 'user',
            entityId: id,
            metadata: { status: dto.status },
        });

        return toUserView(user);
    }


    // ---------------- Delete User ----------------

    async deleteUser(actor: AuthUser, id: string) {
        await this.prisma.user.update({
            where: { id },
            data: { status: UserStatus.DELETED },
        });

        await this.audit.record({
            actorId: actor.id,
            action: 'user.delete',
            entityType: 'user',
            entityId: id,
        });

        return { deleted: true };
    }


    // ---------------- Pending Donors ----------------

    async pendingDonors() {
        const donors = await this.prisma.donorProfile.findMany({
            where: { verification: DonorVerification.UNVERIFIED },
            include: { user: true },
            orderBy: { createdAt: 'asc' },
        });

        return donors.map((donor) => ({
            id: donor.id,
            userId: donor.userId,
            fullName: donor.user.fullName,
            phone: donor.user.phone,
            bloodGroup: toBloodGroupLabel(donor.bloodGroup),
            verification: toDonorVerificationLabel(donor.verification),
            createdAt: donor.createdAt,
        }));
    }


    // ---------------- Verify Donor ----------------

    async verifyDonor(actor: AuthUser, id: string, dto: VerifyDonorDto) {
        const verification = parseDonorVerification(dto.verification);
        const donor = await this.prisma.donorProfile.update({
            where: { id },
            data: { verification },
            include: { user: true },
        });

        await this.audit.record({
            actorId: actor.id,
            action: 'donor.verify',
            entityType: 'donor_profile',
            entityId: id,
            metadata: { verification: dto.verification },
        });

        return {
            id: donor.id,
            userId: donor.userId,
            fullName: donor.user.fullName,
            bloodGroup: toBloodGroupLabel(donor.bloodGroup),
            verification: toDonorVerificationLabel(donor.verification),
        };
    }


    // ---------------- List Requests ----------------

    listRequests(query: AdminRequestQueryDto) {
        return this.requests.listAdmin(query);
    }


    // ---------------- Publish Request ----------------

    async publishRequest(actor: AuthUser, id: string) {
        const request = await this.prisma.bloodRequest.update({
            where: { id },
            data: {
                status: RequestStatus.PUBLISHED,
                reviewedById: actor.id,
            },
        });

        await this.audit.record({
            actorId: actor.id,
            action: 'request.publish',
            entityType: 'blood_request',
            entityId: id,
        });

        await this.prisma.notification.create({
            data: {
                userId: request.recipientId,
                type: NotificationType.STATUS_UPDATE,
                title: 'Blood request published',
                body: 'Your blood request is now visible to matching donors.',
                referenceId: id,
            },
        });

        return { id: request.id, status: toRequestStatusLabel(request.status) };
    }


    // ---------------- Reject Request ----------------

    async rejectRequest(actor: AuthUser, id: string) {
        const request = await this.prisma.bloodRequest.update({
            where: { id },
            data: {
                status: RequestStatus.UNFULFILLED,
                reviewedById: actor.id,
            },
        });

        await this.audit.record({
            actorId: actor.id,
            action: 'request.reject',
            entityType: 'blood_request',
            entityId: id,
        });

        return { id: request.id, status: toRequestStatusLabel(request.status) };
    }


    // ---------------- Assign Donor ----------------

    async assignDonor(actor: AuthUser, id: string, dto: AssignDonorDto) {
        const [request, donor] = await Promise.all([
            this.prisma.bloodRequest.findUnique({ where: { id } }),
            this.prisma.donorProfile.findUnique({
                where: { userId: dto.donorId },
                include: { user: true },
            }),
        ]);

        if (!request || !donor) {
            throw new NotFoundException('Request or donor was not found');
        }

        await this.prisma.requestResponse.upsert({
            where: {
                requestId_donorId: { requestId: id, donorId: dto.donorId },
            },
            create: {
                requestId: id,
                donorId: dto.donorId,
                status: ResponseStatus.ACCEPTED,
            },
            update: {
                status: ResponseStatus.ACCEPTED,
                respondedAt: new Date(),
            },
        });

        await this.prisma.bloodRequest.update({
            where: { id },
            data: { status: RequestStatus.MATCHED },
        });

        await this.audit.record({
            actorId: actor.id,
            action: 'request.assign',
            entityType: 'blood_request',
            entityId: id,
            metadata: { donorId: dto.donorId },
        });

        return { assigned: true };
    }


    // ---------------- Close Request ----------------

    async closeRequest(actor: AuthUser, id: string, dto: CloseRequestDto) {
        const status = parseRequestStatus(dto.status);
        const request = await this.prisma.bloodRequest.update({
            where: { id },
            data: { status },
        });

        await this.audit.record({
            actorId: actor.id,
            action: 'request.close',
            entityType: 'blood_request',
            entityId: id,
            metadata: { status: dto.status },
        });

        return { id: request.id, status: toRequestStatusLabel(request.status) };
    }


    // ---------------- Reports ----------------

    async reports(query: ReportsQueryDto) {
        const where = {
            ...(query.status
                ? { status: parseRequestStatus(query.status) }
                : {}),
            ...(query.from || query.to
                ? {
                    createdAt: {
                        ...(query.from ? { gte: new Date(query.from) } : {}),
                        ...(query.to ? { lte: new Date(query.to) } : {}),
                    },
                }
                : {}),
        };

        const requestsByStatus = await this.prisma.bloodRequest.groupBy({
            by: ['status'],
            where,
            _count: { _all: true },
        });
        const donations = await this.prisma.donation.count();

        return {
            requestsByStatus: requestsByStatus.map((row) => ({
                status: toRequestStatusLabel(row.status),
                count: row._count._all,
            })),
            donations,
        };
    }


    // ---------------- Export Reports ----------------

    async exportReports(query: ReportsQueryDto) {
        const report = await this.reports(query);

        return toCsv(
            ['metric', 'status', 'count'],
            [
                ...report.requestsByStatus.map(
                    (row) =>
                        ['requests', row.status, row.count] satisfies [
                            string,
                            string,
                            number,
                        ],
                ),
                ['donations', '', report.donations],
            ],
        );
    }


    // ---------------- Moderation ----------------

    moderationQueue() {
        return [];
    }


    // ---------------- Settings ----------------

    getSettings() {
        return this.settings.getPublicSettings();
    }


    // ---------------- Update Settings ----------------

    async updateSettings(actor: AuthUser, dto: UpdateSettingsDto) {
        const settings = await this.settings.updateSettings(
            dto.donorCooldownDays,
        );

        await this.audit.record({
            actorId: actor.id,
            action: 'settings.update',
            entityType: 'settings',
            entityId: actor.id,
            metadata: { donorCooldownDays: dto.donorCooldownDays },
        });

        return {
            ...settings,
            metadata: dto.metadata ?? null,
        };
    }


    // ---------------- Announcements ----------------

    createAnnouncement(user: AuthUser, dto: CreateAnnouncementDto) {
        return this.announcements.create(user, dto);
    }

    updateAnnouncement(id: string, dto: UpdateAnnouncementDto) {
        return this.announcements.update(id, dto);
    }

    deleteAnnouncement(id: string) {
        return this.announcements.delete(id);
    }
}
