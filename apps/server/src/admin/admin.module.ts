import { Module } from '@nestjs/common';
import { AnnouncementsModule } from '@/announcements/announcements.module';
import { AuditModule } from '@/audit/audit.module';
import { SettingsService } from '@/common/settings.service';
import { RequestsModule } from '@/requests/requests.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
    imports: [AnnouncementsModule, AuditModule, RequestsModule],
    controllers: [AdminController],
    providers: [AdminService, SettingsService],
})
export class AdminModule {}
