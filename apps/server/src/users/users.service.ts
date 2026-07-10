import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuthUser } from '@/common/types/auth-user';
import { parseBloodGroup } from '@/common/utils/blood-group';
import { UpdateProfileRequest } from './users.dto';
import { toUserView } from './user.presenter';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }


    // ---------------- Get Profile ----------------

    async getProfile(user: AuthUser) {
        const account = await this.prisma.user.findUniqueOrThrow({
            where: { id: user.id },
        });

        return toUserView(account);
    }


    // ---------------- Update Profile ----------------

    async updateProfile(user: AuthUser, dto: UpdateProfileRequest) {
        if (dto.email) {
            const existing = await this.prisma.user.findFirst({
                where: {
                    email: dto.email,
                    NOT: { id: user.id },
                },
                select: { id: true },
            });

            if (existing) {
                throw new ConflictException('Email is already used by another account');
            }
        }

        if (dto.locationId) {
            const location = await this.prisma.location.findUnique({
                where: { id: dto.locationId },
                select: { id: true },
            });

            if (!location) {
                throw new BadRequestException('Invalid locationId');
            }
        }

        const account = await this.prisma.user.update({
            where: { id: user.id },
            data: {
                fullName: dto.fullName,
                email: dto.email,
                bloodGroup: dto.bloodGroup
                    ? parseBloodGroup(dto.bloodGroup)
                    : undefined,
                locationId: dto.locationId,
                preferredLanguage: dto.preferredLanguage,
            },
        });

        return toUserView(account);
    }
}
