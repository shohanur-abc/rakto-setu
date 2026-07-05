import { Module } from '@nestjs/common';
import { DonorsController } from './donors.controller';
import { DonorsService } from './donors.service';
import { RequestsModule } from '../requests/requests.module';
import { SettingsService } from '../common/settings.service';

@Module({
    imports: [RequestsModule],
    controllers: [DonorsController],
    providers: [DonorsService, SettingsService],
    exports: [DonorsService],
})
export class DonorsModule {}
