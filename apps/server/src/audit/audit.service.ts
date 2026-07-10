import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AuditService {
    constructor(private readonly prisma: PrismaService) { }


    // ---------------- Record Action ----------------

    async record(input: {
        actorId: string;
        action: string;
        entityType: string;
        entityId: string;
        metadata?: Prisma.InputJsonValue;
    }) {
        return this.prisma.auditLog.create({
            data: {
                actorId: input.actorId,
                action: input.action,
                entityType: input.entityType,
                entityId: input.entityId,
                metadata: input.metadata,
            },
        });
    }
}
