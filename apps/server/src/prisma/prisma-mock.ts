import { beforeEach } from 'vitest';
import { mockDeep, mockReset, type DeepMockProxy } from 'vitest-mock-extended';
import { PrismaService } from '@/prisma/prisma.service';

export type PrismaMock = DeepMockProxy<PrismaService>;

export const prismaMock = mockDeep<PrismaService>() as PrismaMock;

beforeEach(() => {
    mockReset(prismaMock);
});
