import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuthUser } from '@/common/types/auth-user';
import { CreateAnnouncementRequest } from './announcements.dto';
import { UpdateAnnouncementRequest } from './announcements.dto';

@Injectable()
export class AnnouncementsService {
    constructor(private readonly prisma: PrismaService) { }


    // ---------------- Public List ----------------

    async listPublic() {
        return this.prisma.announcement.findMany({
            where: { isPublished: true },
            orderBy: { createdAt: 'desc' },
        });
    }


    // ---------------- Create Announcement ----------------

    async create(user: AuthUser, dto: CreateAnnouncementRequest) {
        return this.prisma.announcement.create({
            data: {
                authorId: user.id,
                title: dto.title,
                body: dto.body,
                isPublished: dto.isPublished ?? true,
            },
        });
    }


    // ---------------- Update Announcement ----------------

    async update(id: string, dto: UpdateAnnouncementRequest) {
        await this.assertExists(id);

        return this.prisma.announcement.update({
            where: { id },
            data: dto,
        });
    }


    // ---------------- Delete Announcement ----------------

    async delete(id: string) {
        await this.assertExists(id);
        await this.prisma.announcement.delete({ where: { id } });

        return { deleted: true };
    }


    // ---------------- Assert Exists ----------------

    private async assertExists(id: string) {
        const announcement = await this.prisma.announcement.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!announcement) {
            throw new NotFoundException('Announcement was not found');
        }
    }
}
