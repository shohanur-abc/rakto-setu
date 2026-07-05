import { BloodGroup } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

const apiToPrisma = {
    'A+': BloodGroup.A_POSITIVE,
    'A-': BloodGroup.A_NEGATIVE,
    'B+': BloodGroup.B_POSITIVE,
    'B-': BloodGroup.B_NEGATIVE,
    'AB+': BloodGroup.AB_POSITIVE,
    'AB-': BloodGroup.AB_NEGATIVE,
    'O+': BloodGroup.O_POSITIVE,
    'O-': BloodGroup.O_NEGATIVE,
} as const;

const prismaToApi = Object.fromEntries(
    Object.entries(apiToPrisma).map(([api, prisma]) => [prisma, api]),
) as Record<BloodGroup, BloodGroupLabel>;

export type BloodGroupLabel = keyof typeof apiToPrisma;

export const bloodGroupExamples = Object.keys(apiToPrisma);

export const parseBloodGroup = (value: string): BloodGroup => {
    const group = apiToPrisma[value as BloodGroupLabel];

    if (!group) {
        throw new BadRequestException('Unsupported blood group');
    }

    return group;
};

export const toBloodGroupLabel = (value: BloodGroup) => prismaToApi[value];

const canDonateTo: Record<BloodGroup, BloodGroup[]> = {
    [BloodGroup.O_NEGATIVE]: [
        BloodGroup.O_NEGATIVE,
        BloodGroup.O_POSITIVE,
        BloodGroup.A_NEGATIVE,
        BloodGroup.A_POSITIVE,
        BloodGroup.B_NEGATIVE,
        BloodGroup.B_POSITIVE,
        BloodGroup.AB_NEGATIVE,
        BloodGroup.AB_POSITIVE,
    ],
    [BloodGroup.O_POSITIVE]: [
        BloodGroup.O_POSITIVE,
        BloodGroup.A_POSITIVE,
        BloodGroup.B_POSITIVE,
        BloodGroup.AB_POSITIVE,
    ],
    [BloodGroup.A_NEGATIVE]: [
        BloodGroup.A_NEGATIVE,
        BloodGroup.A_POSITIVE,
        BloodGroup.AB_NEGATIVE,
        BloodGroup.AB_POSITIVE,
    ],
    [BloodGroup.A_POSITIVE]: [BloodGroup.A_POSITIVE, BloodGroup.AB_POSITIVE],
    [BloodGroup.B_NEGATIVE]: [
        BloodGroup.B_NEGATIVE,
        BloodGroup.B_POSITIVE,
        BloodGroup.AB_NEGATIVE,
        BloodGroup.AB_POSITIVE,
    ],
    [BloodGroup.B_POSITIVE]: [BloodGroup.B_POSITIVE, BloodGroup.AB_POSITIVE],
    [BloodGroup.AB_NEGATIVE]: [BloodGroup.AB_NEGATIVE, BloodGroup.AB_POSITIVE],
    [BloodGroup.AB_POSITIVE]: [BloodGroup.AB_POSITIVE],
};

export const compatibleRecipientGroupsForDonor = (donorGroup: BloodGroup) =>
    canDonateTo[donorGroup];

export const compatibleDonorGroupsForRecipient = (recipientGroup: BloodGroup) =>
    Object.entries(canDonateTo)
        .filter(([, recipientGroups]) =>
            recipientGroups.includes(recipientGroup),
        )
        .map(([donorGroup]) => donorGroup as BloodGroup);
