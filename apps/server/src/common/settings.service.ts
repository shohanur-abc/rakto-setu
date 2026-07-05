import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const DONOR_COOLDOWN_DAYS_KEY = 'donorCooldownDays';
export const DEFAULT_DONOR_COOLDOWN_DAYS = 90;

@Injectable()
export class SettingsService {
    constructor(private readonly prisma: PrismaService) {}

    async getDonorCooldownDays() {
        const setting = await this.prisma.setting.findUnique({
            where: { key: DONOR_COOLDOWN_DAYS_KEY },
        });
        const value = setting?.value;

        if (typeof value === 'number') {
            return value;
        }

        if (
            value &&
            typeof value === 'object' &&
            !Array.isArray(value) &&
            'donorCooldownDays' in value &&
            typeof value.donorCooldownDays === 'number'
        ) {
            return value.donorCooldownDays;
        }

        return DEFAULT_DONOR_COOLDOWN_DAYS;
    }

    async getPublicSettings() {
        const donorCooldownDays = await this.getDonorCooldownDays();

        return { donorCooldownDays };
    }

    async updateSettings(donorCooldownDays?: number) {
        if (donorCooldownDays !== undefined) {
            await this.prisma.setting.upsert({
                where: { key: DONOR_COOLDOWN_DAYS_KEY },
                create: {
                    key: DONOR_COOLDOWN_DAYS_KEY,
                    value: { donorCooldownDays },
                    description: 'Minimum days between donor completions',
                },
                update: { value: { donorCooldownDays } },
            });
        }

        return this.getPublicSettings();
    }
}
