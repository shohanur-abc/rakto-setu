import { BadRequestException, Injectable, NotFoundException, UnauthorizedException, } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { AuthTokenPurpose, NotificationType, Prisma, Role, UserStatus, } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { AuthUser } from '@/common/types/auth-user';
import { parseBloodGroup } from '@/common/utils/blood-group';
import { createOtpCode, hashLookupToken, hashPassword, verifyPassword, } from '@/common/utils/crypto';
import { addMinutes, jwtExpiresAt } from '@/common/utils/date';
import { PrismaService } from '@/prisma/prisma.service';
import { ChangePasswordRequest } from './auth.dto';
import { CheckAvailabilityRequest } from './auth.dto';
import { ForgotPasswordRequest } from './auth.dto';
import { LoginRequest } from './auth.dto';
import { LogoutRequest } from './auth.dto';
import { RegisterRequest } from './auth.dto';
import { RequestOtpRequest } from './auth.dto';
import { ResetPasswordRequest } from './auth.dto';
import { VerifyOtpRequest } from './auth.dto';
import { toUserView } from '@/users/user.presenter';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
    ) { }


    // ---------------- Register User ----------------

    async register(dto: RegisterRequest) {
        const user = await this.prisma.user.create({
            data: {
                fullName: dto.fullName,
                phone: dto.phone,
                email: dto.email,
                passwordHash: await hashPassword(dto.password),
                role: Role.RECIPIENT,
                bloodGroup: dto.bloodGroup
                    ? parseBloodGroup(dto.bloodGroup)
                    : null,
                locationId: dto.locationId,
                preferredLanguage: dto.preferredLanguage ?? 'bn',
            },
        });

        return toUserView(user);
    }


    // ---------------- Login User ----------------

    async login(dto: LoginRequest) {
        const user = await this.prisma.user.findUnique({
            where: { phone: dto.phone },
        });

        if (
            !user ||
            !(await verifyPassword(dto.password, user.passwordHash))
        ) {
            throw new UnauthorizedException('Invalid phone or password');
        }

        if (
            user.status === UserStatus.SUSPENDED ||
            user.status === UserStatus.DELETED
        ) {
            throw new UnauthorizedException('Account is not active');
        }

        if (
            !user.phoneVerified ||
            user.status === UserStatus.PENDING_VERIFICATION
        ) {
            throw new UnauthorizedException('Phone verification is required');
        }

        return {
            user: toUserView(user),
            token: await this.createSession(user.id, user.phone, user.role),
        };
    }


    // ---------------- Check Availability ----------------

    async checkAvailability(dto: CheckAvailabilityRequest) {
        const { phone, email } = dto;

        if (!phone && !email) {
            throw new BadRequestException({
                message: 'Validation failed',
                errors: [
                    {
                        field: 'identifier',
                        message: 'Phone or email is required',
                    },
                ],
            });
        }

        const orConditions: Prisma.UserWhereInput[] = [];
        if (phone) orConditions.push({ phone });
        if (email) orConditions.push({ email });

        const users = await this.prisma.user.findMany({
            where: {
                OR: orConditions,
            },
            select: {
                phone: true,
                email: true,
            },
        });

        const errors: { field: string; message: string }[] = [];

        if (phone && users.some((user) => user.phone === phone)) {
            errors.push({
                field: 'phone',
                message: 'This phone number is already registered',
            });
        }

        if (email && users.some((user) => user.email === email)) {
            errors.push({
                field: 'email',
                message: 'This email is already registered',
            });
        }

        return {
            available: errors.length === 0,
            errors,
        };
    }


    // ---------------- Logout User ----------------

    async logout(user: AuthUser, dto: LogoutRequest) {
        await this.prisma.authToken.updateMany({
            where: dto.allSessions
                ? {
                    userId: user.id,
                    purpose: AuthTokenPurpose.SESSION,
                    usedAt: null,
                }
                : {
                    tokenHash: hashLookupToken(user.jti),
                    purpose: AuthTokenPurpose.SESSION,
                },
            data: { usedAt: new Date() },
        });

        return { loggedOut: true };
    }


    // ---------------- Request Otp ----------------

    async requestOtp(dto: RequestOtpRequest) {
        return this.createCodeToken(
            dto.phone,
            AuthTokenPurpose.OTP,
            'OTP code',
        );
    }


    // ---------------- Verify Otp ----------------

    async verifyOtp(dto: VerifyOtpRequest) {
        const token = await this.consumeCodeToken(
            dto.phone,
            dto.code,
            AuthTokenPurpose.OTP,
        );

        if (token.userId) {
            await this.prisma.user.update({
                where: { id: token.userId },
                data: {
                    phoneVerified: true,
                    status: UserStatus.ACTIVE,
                },
            });
        }

        return { verified: true };
    }


    // ---------------- Forgot Password ----------------

    async forgotPassword(dto: ForgotPasswordRequest) {
        return this.createCodeToken(
            dto.phone,
            AuthTokenPurpose.PASSWORD_RESET,
            'Password reset code',
        );
    }


    // ---------------- Reset Password ----------------

    async resetPassword(dto: ResetPasswordRequest) {
        const token = await this.consumeCodeToken(
            dto.phone,
            dto.code,
            AuthTokenPurpose.PASSWORD_RESET,
        );

        const user = token.userId
            ? await this.prisma.user.update({
                where: { id: token.userId },
                data: { passwordHash: await hashPassword(dto.newPassword) },
            })
            : null;

        if (!user) {
            throw new NotFoundException('Account was not found');
        }

        return { reset: true };
    }


    // ---------------- Change Password ----------------

    async changePassword(user: AuthUser, dto: ChangePasswordRequest) {
        const account = await this.prisma.user.findUniqueOrThrow({
            where: { id: user.id },
        });

        if (
            !(await verifyPassword(dto.currentPassword, account.passwordHash))
        ) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        await this.prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: await hashPassword(dto.newPassword) },
        });

        return { changed: true };
    }


    // ---------------- Current User ----------------

    async me(user: AuthUser) {
        const account = await this.prisma.user.findUniqueOrThrow({
            where: { id: user.id },
        });

        return toUserView(account);
    }


    // ---------------- Create Session ----------------

    private async createSession(userId: string, phone: string, role: Role) {
        const jti = randomUUID();
        const expiresIn = this.config.get<string>('JWT_EXPIRES_IN') ?? '7d';

        await this.prisma.authToken.create({
            data: {
                userId,
                tokenHash: hashLookupToken(jti),
                purpose: AuthTokenPurpose.SESSION,
                expiresAt: jwtExpiresAt(expiresIn),
            },
        });

        return this.jwtService.signAsync(
            { sub: userId, phone, role, jti },
            { expiresIn: expiresIn as JwtSignOptions['expiresIn'] },
        );
    }


    // ---------------- Create Code ----------------

    private async createCodeToken(
        phone: string,
        purpose: AuthTokenPurpose,
        title: string,
    ) {
        const code = createOtpCode();
        const user = await this.prisma.user.findUnique({ where: { phone } });

        await this.prisma.authToken.create({
            data: {
                userId: user?.id,
                phone,
                tokenHash: await hashPassword(code),
                purpose,
                expiresAt: addMinutes(new Date(), 10),
            },
        });

        if (user) {
            await this.prisma.notification.create({
                data: {
                    userId: user.id,
                    type: NotificationType.STATUS_UPDATE,
                    title,
                    body: `Your RaktoSetu code is ${code}. It expires in 10 minutes.`,
                    channel: 'in_app',
                },
            });
        }

        return {
            sent: true,
            devCode: code,
        };
    }


    // ---------------- Consume Code ----------------

    private async consumeCodeToken(
        phone: string,
        code: string,
        purpose: AuthTokenPurpose,
    ) {
        const candidates = await this.prisma.authToken.findMany({
            where: {
                phone,
                purpose,
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });

        for (const token of candidates) {
            if (await verifyPassword(code, token.tokenHash)) {
                await this.prisma.authToken.update({
                    where: { id: token.id },
                    data: { usedAt: new Date() },
                });

                return token;
            }
        }

        throw new UnauthorizedException('Invalid or expired code');
    }
}
