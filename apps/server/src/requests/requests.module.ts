import { Module } from '@nestjs/common';
import { SettingsService } from '../common/settings.service';
import { RequestCompletionService } from './request-completion.service';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';

@Module({
    controllers: [RequestsController],
    providers: [RequestsService, RequestCompletionService, SettingsService],
    exports: [RequestsService, RequestCompletionService],
})
export class RequestsModule {}
