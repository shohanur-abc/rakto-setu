import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_DONOR_COOLDOWN_DAYS, DONOR_COOLDOWN_DAYS_KEY, SettingsService } from './settings.service';
import { prismaMock } from '@/prisma/prisma-mock';

const createdAt = new Date('2026-01-01T00:00:00.000Z');

describe('SettingsService', () => {
    let service: SettingsService;

    beforeEach(() => {
        service = new SettingsService(prismaMock as never);
    });

    it('returns default donor cooldown when setting is missing', async () => {
        prismaMock.setting.findUnique.mockResolvedValue(null);

        await expect(service.getDonorCooldownDays()).resolves.toBe(
            DEFAULT_DONOR_COOLDOWN_DAYS,
        );
    });

    it('reads donor cooldown from object-shaped setting value', async () => {
        prismaMock.setting.findUnique.mockResolvedValue({
            id: '11111111-1111-1111-1111-111111111111',
            key: DONOR_COOLDOWN_DAYS_KEY,
            value: { donorCooldownDays: 120 },
            description: null,
            createdAt,
            updatedAt: createdAt,
        } as never);

        await expect(service.getDonorCooldownDays()).resolves.toBe(120);
    });

    it('upserts donor cooldown and returns public settings', async () => {
        prismaMock.setting.upsert.mockResolvedValue({} as never);
        prismaMock.setting.findUnique.mockResolvedValue({
            id: '11111111-1111-1111-1111-111111111111',
            key: DONOR_COOLDOWN_DAYS_KEY,
            value: { donorCooldownDays: 60 },
            description: null,
            createdAt,
            updatedAt: createdAt,
        } as never);

        const result = await service.updateSettings(60);

        expect(result).toEqual({ donorCooldownDays: 60 });
        expect(prismaMock.setting.upsert).toHaveBeenCalledWith({
            where: { key: DONOR_COOLDOWN_DAYS_KEY },
            create: expect.objectContaining({
                key: DONOR_COOLDOWN_DAYS_KEY,
                value: { donorCooldownDays: 60 },
            }),
            update: { value: { donorCooldownDays: 60 } },
        });
    });
});
