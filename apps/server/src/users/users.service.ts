import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../common/types/auth-user';
import { parseBloodGroup } from '../common/utils/blood-group';
import { UpdateProfileDto } from './dto/user.dto';
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

    async updateProfile(user: AuthUser, dto: UpdateProfileDto) {
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
