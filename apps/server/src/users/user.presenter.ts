import { BloodGroup, Role, UserStatus } from '@prisma/client';
import { toUserStatusLabel } from '@/common/utils/api-enums';
import { toBloodGroupLabel } from '@/common/utils/blood-group';

export type UserView = {
    id: string;
    fullName: string;
    phone: string;
    email: string | null;
    role: Role;
    bloodGroup: string | null;
    locationId: string | null;
    status: string;
    phoneVerified: boolean;
    preferredLanguage: string;
    createdAt: Date;
    updatedAt: Date;
};

export type PresentableUser = {
    id: string;
    fullName: string;
    phone: string;
    email: string | null;
    role: Role;
    bloodGroup: BloodGroup | null;
    locationId: string | null;
    status: UserStatus;
    phoneVerified: boolean;
    preferredLanguage: string;
    createdAt: Date;
    updatedAt: Date;
};

export const toUserView = (user: PresentableUser): UserView => ({
    id: user.id,
    fullName: user.fullName,
    phone: user.phone,
    email: user.email,
    role: user.role,
    bloodGroup: user.bloodGroup ? toBloodGroupLabel(user.bloodGroup) : null,
    locationId: user.locationId,
    status: toUserStatusLabel(user.status),
    phoneVerified: user.phoneVerified,
    preferredLanguage: user.preferredLanguage,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});
