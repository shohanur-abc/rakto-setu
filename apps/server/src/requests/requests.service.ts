import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RequestStatus, ResponseStatus } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { AuthUser } from '@/common/types/auth-user';
import { parseBloodGroup, toBloodGroupLabel } from '@/common/utils/blood-group';
import { parseRequestStatus, parseRequestUrgency, toRequestStatusLabel, toRequestUrgencyLabel, toResponseStatusLabel } from '@/common/utils/api-enums';
import { getPagination, makePage } from '@/common/utils/pagination';
import { ConfirmRecipientCompletionRequest } from './requests.dto';
import { CancelAcceptedMatchRequest } from './requests.dto';
import { CreateBloodRequestRequest } from './requests.dto';
import { AdminRequestQueryRequest, PublicRequestQueryRequest } from './requests.dto';
import { UpdateBloodRequestRequest } from './requests.dto';
import { RequestCompletionService } from './request-completion.service';

const editableStatuses: RequestStatus[] = [
    RequestStatus.DRAFT,
    RequestStatus.PENDING_REVIEW,
];
const terminalStatuses: RequestStatus[] = [
    RequestStatus.FULFILLED,
    RequestStatus.CANCELLED,
    RequestStatus.EXPIRED,
    RequestStatus.UNFULFILLED,
];

@Injectable()
export class RequestsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly completion: RequestCompletionService,
    ) { }


    // ---------------- Create Request ----------------

    async create(user: AuthUser, dto: CreateBloodRequestRequest) {
        const location = await this.prisma.location.findUnique({
            where: { id: dto.locationId },
            select: { id: true },
        });

        if (!location) {
            throw new NotFoundException('Location was not found');
        }

        const request = await this.prisma.bloodRequest.create({
            data: {
                recipientId: user.id,
                patientName: dto.patientName,
                patientAge: dto.patientAge,
                bloodGroup: parseBloodGroup(dto.bloodGroup),
                unitsNeeded: dto.unitsNeeded ?? 1,
                hospitalName: dto.hospitalName,
                locationId: dto.locationId,
                urgency: parseRequestUrgency(dto.urgency),
                neededBy: new Date(dto.neededBy),
                notes: dto.notes,
                status: RequestStatus.PENDING_REVIEW,
            },
            include: { location: true },
        });

        return this.toRequestView(request, { includeContact: false });
    }


    // ---------------- Own Requests ----------------

    async listOwn(user: AuthUser, query: PublicRequestQueryRequest) {
        const page = getPagination(query);
        const where = { recipientId: user.id };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.bloodRequest.findMany({
                where,
                include: { location: true },
                orderBy: { createdAt: 'desc' },
                skip: page.skip,
                take: page.take,
            }),
            this.prisma.bloodRequest.count({ where }),
        ]);

        return makePage(
            items.map((request) =>
                this.toRequestView(request, { includeContact: false }),
            ),
            total,
            query,
        );
    }


    // ---------------- Public Requests ----------------

    async listPublic(query: PublicRequestQueryRequest) {
        const page = getPagination(query);
        const where = {
            status: RequestStatus.PUBLISHED,
            ...(query.bloodGroup
                ? { bloodGroup: parseBloodGroup(query.bloodGroup) }
                : {}),
            ...(query.locationId ? { locationId: query.locationId } : {}),
            ...(query.urgency
                ? { urgency: parseRequestUrgency(query.urgency) }
                : {}),
        };
        const [items, total] = await Promise.all([
            this.prisma.bloodRequest.findMany({
                where,
                include: { location: true },
                orderBy: { neededBy: 'asc' },
                skip: page.skip,
                take: page.take,
            }),
            this.prisma.bloodRequest.count({ where }),
        ]);

        return makePage(
            items.map((request) =>
                this.toRequestView(request, { includeContact: false }),
            ),
            total,
            query,
        );
    }


    // ---------------- Public Detail ----------------

    async getPublic(id: string) {
        const request = await this.prisma.bloodRequest.findFirst({
            where: { id, status: RequestStatus.PUBLISHED },
            include: { location: true },
        });

        if (!request) {
            throw new NotFoundException(
                'Published blood request was not found',
            );
        }

        return this.toRequestView(request, { includeContact: false });
    }


    // ---------------- Own Detail ----------------

    async getOwn(user: AuthUser, id: string) {
        const request = await this.prisma.bloodRequest.findFirst({
            where: { id, recipientId: user.id },
            include: {
                location: true,
                responses: {
                    where: { status: ResponseStatus.ACCEPTED },
                    include: { donor: true },
                },
            },
        });

        if (!request) {
            throw new NotFoundException('Blood request was not found');
        }

        return this.toRequestView(request, { includeContact: true });
    }


    // ---------------- Update Request ----------------

    async update(user: AuthUser, id: string, dto: UpdateBloodRequestRequest) {
        const existing = await this.prisma.bloodRequest.findFirst({
            where: { id, recipientId: user.id },
        });

        if (!existing) {
            throw new NotFoundException('Blood request was not found');
        }

        if (!editableStatuses.includes(existing.status)) {
            throw new BadRequestException(
                'Only draft or pending requests can be edited',
            );
        }

        const request = await this.prisma.bloodRequest.update({
            where: { id },
            data: {
                patientName: dto.patientName,
                patientAge: dto.patientAge,
                unitsNeeded: dto.unitsNeeded,
                hospitalName: dto.hospitalName,
                urgency: dto.urgency
                    ? parseRequestUrgency(dto.urgency)
                    : undefined,
                neededBy: dto.neededBy ? new Date(dto.neededBy) : undefined,
                notes: dto.notes,
            },
            include: { location: true },
        });

        return this.toRequestView(request, { includeContact: false });
    }


    // ---------------- Cancel Request ----------------

    async cancel(user: AuthUser, id: string) {
        const existing = await this.prisma.bloodRequest.findFirst({
            where: { id, recipientId: user.id },
        });

        if (!existing) {
            throw new NotFoundException('Blood request was not found');
        }

        if (terminalStatuses.includes(existing.status)) {
            throw new BadRequestException('Request is already closed');
        }

        const request = await this.prisma.bloodRequest.update({
            where: { id },
            data: { status: RequestStatus.CANCELLED },
            include: { location: true },
        });

        return this.toRequestView(request, { includeContact: false });
    }


    // ---------------- Request Status ----------------

    async getStatus(user: AuthUser, id: string) {
        const request = await this.prisma.bloodRequest.findFirst({
            where: { id, recipientId: user.id },
            select: {
                id: true,
                status: true,
                unitsNeeded: true,
                unitsFulfilled: true,
                updatedAt: true,
            },
        });

        if (!request) {
            throw new NotFoundException('Blood request was not found');
        }

        return {
            id: request.id,
            status: toRequestStatusLabel(request.status),
            unitsNeeded: request.unitsNeeded,
            unitsFulfilled: request.unitsFulfilled,
            updatedAt: request.updatedAt,
        };
    }


    // ---------------- Accepted Matches ----------------

    async getMatches(user: AuthUser, id: string) {
        await this.assertOwnRequest(user.id, id);

        const responses = await this.prisma.requestResponse.findMany({
            where: { requestId: id, status: ResponseStatus.ACCEPTED },
            include: { donor: { include: { donorProfile: true } } },
            orderBy: { respondedAt: 'desc' },
        });

        return responses.map((response) => ({
            id: response.id,
            status: toResponseStatusLabel(response.status),
            donorConfirmedCompletion: response.donorConfirmedCompletion,
            recipientConfirmedCompletion: response.recipientConfirmedCompletion,
            respondedAt: response.respondedAt,
            donor: {
                id: response.donor.id,
                fullName: response.donor.fullName,
                phone: response.donor.phone,
                email: response.donor.email,
                bloodGroup: response.donor.donorProfile
                    ? toBloodGroupLabel(response.donor.donorProfile.bloodGroup)
                    : null,
            },
        }));
    }


    // ---------------- Cancel Accepted Match ----------------

    async cancelMatch(
        user: AuthUser,
        id: string,
        donorId: string,
        dto: CancelAcceptedMatchRequest,
    ) {
        const now = new Date();
        const response = await this.prisma.$transaction(async (tx) => {
            const request = await tx.bloodRequest.findFirst({
                where: { id, recipientId: user.id },
                select: {
                    id: true,
                    status: true,
                },
            });

            if (!request) {
                throw new NotFoundException('Blood request was not found');
            }

            if (terminalStatuses.includes(request.status)) {
                throw new BadRequestException('Request is already closed');
            }

            const existing = await tx.requestResponse.findUnique({
                where: { requestId_donorId: { requestId: id, donorId } },
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

            const updated = await tx.requestResponse.update({
                where: { requestId_donorId: { requestId: id, donorId } },
                data: {
                    status: ResponseStatus.WITHDRAWN,
                    cancelledAt: now,
                    cancelledBy: user.id,
                    cancelReason: dto.cancelReason,
                },
            });

            await this.reopenRequestIfNoAcceptedResponses(tx, id);

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
        id: string,
        dto: ConfirmRecipientCompletionRequest,
    ) {
        return this.completion.confirmRecipient(id, user.id, dto.donorId);
    }


    // ---------------- Admin List ----------------

    async listAdmin(query: AdminRequestQueryRequest) {
        const page = getPagination(query);
        const where = {
            ...(query.status
                ? { status: parseRequestStatus(query.status) }
                : {}),
            ...(query.bloodGroup
                ? { bloodGroup: parseBloodGroup(query.bloodGroup) }
                : {}),
            ...(query.locationId ? { locationId: query.locationId } : {}),
            ...(query.urgency
                ? { urgency: parseRequestUrgency(query.urgency) }
                : {}),
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.bloodRequest.findMany({
                where,
                include: { location: true, recipient: true },
                orderBy: { createdAt: 'desc' },
                skip: page.skip,
                take: page.take,
            }),
            this.prisma.bloodRequest.count({ where }),
        ]);

        return makePage(
            items.map((request) =>
                this.toRequestView(request, { includeContact: true }),
            ),
            total,
            query,
        );
    }


    // ---------------- Assert Own ----------------

    private async assertOwnRequest(recipientId: string, id: string) {
        const request = await this.prisma.bloodRequest.findFirst({
            where: { id, recipientId },
            select: { id: true },
        });

        if (!request) {
            throw new NotFoundException('Blood request was not found');
        }
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

        if (!request || terminalStatuses.includes(request.status)) {
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


    // ---------------- Request View ----------------

    private toRequestView(
        request: {
            id: string;
            recipientId: string;
            patientName: string;
            patientAge: number | null;
            bloodGroup: ReturnType<typeof parseBloodGroup>;
            unitsNeeded: number;
            unitsFulfilled: number;
            hospitalName: string;
            locationId: string;
            location?: unknown;
            urgency: ReturnType<typeof parseRequestUrgency>;
            neededBy: Date;
            status: RequestStatus;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            responses?: Array<{
                donor: {
                    id: string;
                    fullName: string;
                    phone: string;
                    email: string | null;
                };
            }>;
            recipient?: {
                id: string;
                fullName: string;
                phone: string;
                email: string | null;
            };
        },
        options: { includeContact: boolean },
    ) {
        return {
            id: request.id,
            recipientId: request.recipientId,
            patientName: request.patientName,
            patientAge: request.patientAge,
            bloodGroup: toBloodGroupLabel(request.bloodGroup),
            unitsNeeded: request.unitsNeeded,
            unitsFulfilled: request.unitsFulfilled,
            hospitalName: request.hospitalName,
            locationId: request.locationId,
            location: request.location ?? null,
            urgency: toRequestUrgencyLabel(request.urgency),
            neededBy: request.neededBy,
            status: toRequestStatusLabel(request.status),
            notes: request.notes,
            ...(options.includeContact
                ? {
                    acceptedDonors:
                        request.responses?.map((response) => ({
                            id: response.donor.id,
                            fullName: response.donor.fullName,
                            phone: response.donor.phone,
                            email: response.donor.email,
                        })) ?? [],
                }
                : {}),
            ...(options.includeContact && request.recipient
                ? {
                    recipientContact: {
                        id: request.recipient.id,
                        fullName: request.recipient.fullName,
                        phone: request.recipient.phone,
                        email: request.recipient.email,
                    },
                }
                : {}),
            createdAt: request.createdAt,
            updatedAt: request.updatedAt,
        };
    }
}
