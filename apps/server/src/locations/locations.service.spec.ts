import { beforeEach, describe, expect, it } from 'vitest';
import { LocationsService } from './locations.service';
import { prismaMock } from '@/prisma/prisma-mock';

const createdAt = new Date('2026-01-01T00:00:00.000Z');
const location = {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Example Union',
    type: 'union',
    parentId: null,
    createdAt,
    updatedAt: createdAt,
};

describe('LocationsService', () => {
    let service: LocationsService;

    beforeEach(() => {
        service = new LocationsService(prismaMock as never);
    });

    it('returns locations ordered by type and name', async () => {
        prismaMock.location.findMany.mockResolvedValue([location] as never);

        const result = await service.list();

        expect(result).toEqual([location]);
        expect(prismaMock.location.findMany).toHaveBeenCalledWith({
            orderBy: [{ type: 'asc' }, { name: 'asc' }],
        });
    });
});
