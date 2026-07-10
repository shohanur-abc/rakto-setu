import { ConflictException, Injectable, NotFoundException, } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class EntityValidatorService {
    constructor(private readonly prisma: PrismaService) { }

    async ensureLocationExists(locationId: string) {
        const location = await this.prisma.location.findUnique({
            where: { id: locationId },
            select: { id: true, name: true, type: true },
        });

        if (!location) {
            throw new NotFoundException('Location was not found');
        }

        return location;
    }

    async ensureEmailAvailable(email: string, exceptUserId?: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                email,
                ...(exceptUserId
                    ? {
                        id: { not: exceptUserId },
                    }
                    : {}),
            },
            select: { id: true },
        });

        if (user) {
            throw new ConflictException('Email address is already used');
        }
    }

    async ensurePhoneAvailable(phone: string, exceptUserId?: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                phone,
                ...(exceptUserId
                    ? {
                        id: { not: exceptUserId },
                    }
                    : {}),
            },
            select: { id: true },
        });

        if (user) {
            throw new ConflictException('Phone number is already used');
        }
    }

    async ensureDonorProfileExists(userId: string) {
        const donorProfile = await this.prisma.donorProfile.findUnique({
            where: { userId },
        });

        if (!donorProfile) {
            throw new NotFoundException('Donor profile was not found');
        }

        return donorProfile;
    }

    async ensureBloodRequestExists(requestId: string) {
        const bloodRequest = await this.prisma.bloodRequest.findUnique({
            where: { id: requestId },
        });

        if (!bloodRequest) {
            throw new NotFoundException('Blood request was not found');
        }

        return bloodRequest;
    }
}