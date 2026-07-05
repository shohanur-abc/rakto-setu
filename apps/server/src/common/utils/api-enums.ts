import {
    DonorVerification,
    RequestStatus,
    RequestUrgency,
    ResponseStatus,
    UserStatus,
} from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

export const userStatusValues = [
    'active',
    'pending_verification',
    'suspended',
    'deleted',
] as const;

export const donorVerificationValues = [
    'unverified',
    'verified',
    'rejected',
] as const;

export const requestUrgencyValues = ['routine', 'urgent', 'emergency'] as const;

export const requestStatusValues = [
    'draft',
    'pending_review',
    'published',
    'matched',
    'in_progress',
    'fulfilled',
    'cancelled',
    'expired',
    'unfulfilled',
] as const;

const userStatusMap = {
    active: UserStatus.ACTIVE,
    pending_verification: UserStatus.PENDING_VERIFICATION,
    suspended: UserStatus.SUSPENDED,
    deleted: UserStatus.DELETED,
} as const;

const donorVerificationMap = {
    unverified: DonorVerification.UNVERIFIED,
    verified: DonorVerification.VERIFIED,
    rejected: DonorVerification.REJECTED,
} as const;

const requestUrgencyMap = {
    routine: RequestUrgency.ROUTINE,
    urgent: RequestUrgency.URGENT,
    emergency: RequestUrgency.EMERGENCY,
} as const;

const requestStatusMap = {
    draft: RequestStatus.DRAFT,
    pending_review: RequestStatus.PENDING_REVIEW,
    published: RequestStatus.PUBLISHED,
    matched: RequestStatus.MATCHED,
    in_progress: RequestStatus.IN_PROGRESS,
    fulfilled: RequestStatus.FULFILLED,
    cancelled: RequestStatus.CANCELLED,
    expired: RequestStatus.EXPIRED,
    unfulfilled: RequestStatus.UNFULFILLED,
} as const;

const reverseUserStatusMap: Record<UserStatus, string> = {
    [UserStatus.ACTIVE]: 'active',
    [UserStatus.PENDING_VERIFICATION]: 'pending_verification',
    [UserStatus.SUSPENDED]: 'suspended',
    [UserStatus.DELETED]: 'deleted',
};

const reverseDonorVerificationMap: Record<DonorVerification, string> = {
    [DonorVerification.UNVERIFIED]: 'unverified',
    [DonorVerification.VERIFIED]: 'verified',
    [DonorVerification.REJECTED]: 'rejected',
};

const reverseRequestUrgencyMap: Record<RequestUrgency, string> = {
    [RequestUrgency.ROUTINE]: 'routine',
    [RequestUrgency.URGENT]: 'urgent',
    [RequestUrgency.EMERGENCY]: 'emergency',
};

const reverseRequestStatusMap: Record<RequestStatus, string> = {
    [RequestStatus.DRAFT]: 'draft',
    [RequestStatus.PENDING_REVIEW]: 'pending_review',
    [RequestStatus.PUBLISHED]: 'published',
    [RequestStatus.MATCHED]: 'matched',
    [RequestStatus.IN_PROGRESS]: 'in_progress',
    [RequestStatus.FULFILLED]: 'fulfilled',
    [RequestStatus.CANCELLED]: 'cancelled',
    [RequestStatus.EXPIRED]: 'expired',
    [RequestStatus.UNFULFILLED]: 'unfulfilled',
};

const reverseResponseStatusMap: Record<ResponseStatus, string> = {
    [ResponseStatus.ACCEPTED]: 'accepted',
    [ResponseStatus.DECLINED]: 'declined',
    [ResponseStatus.WITHDRAWN]: 'withdrawn',
};

export const parseUserStatus = (value: string) => {
    const status = userStatusMap[value as keyof typeof userStatusMap];

    if (!status) {
        throw new BadRequestException('Unsupported user status');
    }

    return status;
};

export const parseDonorVerification = (value: string) => {
    const status =
        donorVerificationMap[value as keyof typeof donorVerificationMap];

    if (!status) {
        throw new BadRequestException('Unsupported donor verification status');
    }

    return status;
};

export const parseRequestUrgency = (value: string) => {
    const urgency = requestUrgencyMap[value as keyof typeof requestUrgencyMap];

    if (!urgency) {
        throw new BadRequestException('Unsupported request urgency');
    }

    return urgency;
};

export const parseRequestStatus = (value: string) => {
    const status = requestStatusMap[value as keyof typeof requestStatusMap];

    if (!status) {
        throw new BadRequestException('Unsupported request status');
    }

    return status;
};

export const toUserStatusLabel = (value: UserStatus) =>
    reverseUserStatusMap[value];

export const toDonorVerificationLabel = (value: DonorVerification) =>
    reverseDonorVerificationMap[value];

export const toRequestUrgencyLabel = (value: RequestUrgency) =>
    reverseRequestUrgencyMap[value];

export const toRequestStatusLabel = (value: RequestStatus) =>
    reverseRequestStatusMap[value];

export const toResponseStatusLabel = (value: ResponseStatus) =>
    reverseResponseStatusMap[value];
