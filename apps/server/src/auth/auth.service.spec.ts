import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthTokenPurpose, BloodGroup, Role, UserStatus } from '@prisma/client';
import { AuthService } from './auth.service';
import { hashPassword } from '../common/utils/crypto';
import { prismaMock } from '../../test/prisma-mock';

const createdAt = new Date('2026-01-01T00:00:00.000Z');

const baseUser = {
    id: '11111111-1111-1111-1111-111111111111',
    fullName: 'Md Rahim Uddin',
    phone: '+8801712345678',
    email: null,
    passwordHash: 'hashed-password',
    role: Role.RECIPIENT,
    bloodGroup: null,
    locationId: null,
    status: UserStatus.ACTIVE,
    phoneVerified: true,
    preferredLanguage: 'bn',
    createdAt,
    updatedAt: createdAt,
};

describe('AuthService', () => {
    let service: AuthService;
    let jwtService: JwtService;
    let configService: ConfigService;

    beforeEach(() => {
        jwtService = {
            signAsync: vi.fn().mockResolvedValue('jwt-token'),
        } as unknown as JwtService;
        configService = {
            get: vi.fn((key: string) =>
                key === 'JWT_EXPIRES_IN' ? '7d' : undefined,
            ),
        } as unknown as ConfigService;
        service = new AuthService(
            prismaMock,
            jwtService,
            configService,
        );
    });

    it('registers public users as recipients only', async () => {
        prismaMock.user.findFirst.mockResolvedValue(null);
        prismaMock.user.create.mockResolvedValue({
            ...baseUser,
            status: UserStatus.PENDING_VERIFICATION,
            phoneVerified: false,
            bloodGroup: BloodGroup.O_POSITIVE,
        } as never);

        const result = await service.register({
            fullName: baseUser.fullName,
            phone: baseUser.phone,
            password: 'StrongPass123!',
            bloodGroup: 'O+',
        });

        expect(result.role).toBe(Role.RECIPIENT);
        expect(result.bloodGroup).toBe('O+');
        expect(prismaMock.user.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    role: Role.RECIPIENT,
                    bloodGroup: BloodGroup.O_POSITIVE,
                    preferredLanguage: 'bn',
                }),
            }),
        );
    });

    it('rejects duplicate phone or email during registration', async () => {
        prismaMock.user.findFirst.mockResolvedValue(baseUser);

        await expect(
            service.register({
                fullName: baseUser.fullName,
                phone: baseUser.phone,
                password: 'StrongPass123!',
            }),
        ).rejects.toBeInstanceOf(ConflictException);
    });

    it('logs in verified users and creates a session token', async () => {
        const passwordHash = await hashPassword('StrongPass123!');
        prismaMock.user.findUnique.mockResolvedValue({
            ...baseUser,
            passwordHash,
        } as never);
        prismaMock.authToken.create.mockResolvedValue({} as never);

        const result = await service.login({
            phone: baseUser.phone,
            password: 'StrongPass123!',
        });

        expect(result.token).toBe('jwt-token');
        expect(prismaMock.authToken.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    userId: baseUser.id,
                    purpose: AuthTokenPurpose.SESSION,
                }),
            }),
        );
        expect(jwtService.signAsync).toHaveBeenCalledWith(
            expect.objectContaining({
                sub: baseUser.id,
                phone: baseUser.phone,
                role: Role.RECIPIENT,
            }),
            { expiresIn: '7d' },
        );
    });

    it('requires phone verification before login', async () => {
        const passwordHash = await hashPassword('StrongPass123!');
        prismaMock.user.findUnique.mockResolvedValue({
            ...baseUser,
            passwordHash,
            phoneVerified: false,
            status: UserStatus.PENDING_VERIFICATION,
        } as never);

        await expect(
            service.login({
                phone: baseUser.phone,
                password: 'StrongPass123!',
            }),
        ).rejects.toBeInstanceOf(UnauthorizedException);
    });
});
