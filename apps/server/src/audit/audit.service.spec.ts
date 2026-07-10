import { beforeEach, describe, expect, it } from 'vitest';
import { AuditService } from './audit.service';
import { prismaMock } from '@/prisma/prisma-mock';

const createdAt = new Date('2026-01-01T00:00:00.000Z');

describe('AuditService', () => {
    let service: AuditService;

    beforeEach(() => {
        service = new AuditService(prismaMock as never);
    });

    it('records an audit log entry with metadata', async () => {
        const input = {
            actorId: '11111111-1111-1111-1111-111111111111',
            action: 'user.status_update',
            entityType: 'user',
            entityId: '22222222-2222-2222-2222-222222222222',
            metadata: { status: 'suspended' },
        };
        prismaMock.auditLog.create.mockResolvedValue({
            id: '33333333-3333-3333-3333-333333333333',
            ...input,
            createdAt,
        } as never);

        const result = await service.record(input);

        expect(result.action).toBe(input.action);
        expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
            data: input,
        });
    });
});
