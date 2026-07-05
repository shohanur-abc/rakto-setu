import { beforeEach, describe, expect, it } from 'vitest';
import { BloodGroup, Role, UserStatus } from '@prisma/client';
import { UsersService } from './users.service';
import { AuthUser } from '../common/types/auth-user';
import { prismaMock } from '../../test/prisma-mock';

const createdAt = new Date('2026-01-01T00:00:00.000Z');
const authUser: AuthUser = {
    id: '11111111-1111-1111-1111-111111111111',
    phone: '+8801712345678',
    role: Role.RECIPIENT,
    jti: 'session-id',
};

const baseUser = {
    id: authUser.id,
    fullName: 'Md Rahim Uddin',
    phone: authUser.phone,
    email: null,
    passwordHash: 'hash',
    role: Role.RECIPIENT,
    bloodGroup: BloodGroup.O_POSITIVE,
    locationId: null,
    status: UserStatus.ACTIVE,
    phoneVerified: true,
    preferredLanguage: 'bn',
    createdAt,
    updatedAt: createdAt,
};

describe('UsersService', () => {
    let service: UsersService;

    beforeEach(() => {
        service = new UsersService(prismaMock as never);
    });

    it('returns the authenticated user profile as an API view', async () => {
        prismaMock.user.findUniqueOrThrow.mockResolvedValue(baseUser as never);

        const result = await service.getProfile(authUser);

        expect(result.id).toBe(authUser.id);
        expect(result.bloodGroup).toBe('O+');
        expect(result.status).toBe('active');
        expect(result).not.toHaveProperty('passwordHash');
    });

    it('updates profile fields and parses blood group labels', async () => {
        prismaMock.user.update.mockResolvedValue({
            ...baseUser,
            fullName: 'Md Karim Uddin',
            bloodGroup: BloodGroup.A_POSITIVE,
            preferredLanguage: 'en',
        } as never);

        const result = await service.updateProfile(authUser, {
            fullName: 'Md Karim Uddin',
            bloodGroup: 'A+',
            preferredLanguage: 'en',
        });

        expect(result.fullName).toBe('Md Karim Uddin');
        expect(result.bloodGroup).toBe('A+');
        expect(prismaMock.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: authUser.id },
                data: expect.objectContaining({
                    bloodGroup: BloodGroup.A_POSITIVE,
                    preferredLanguage: 'en',
                }),
            }),
        );
    });
});
