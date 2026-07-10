import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiRoute } from '@/common/decorators/api-route.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { PublicAnnouncementResponse } from './announcements.dto';
import { AnnouncementsService } from './announcements.service';

@ApiTags('Announcements')
@Controller('announcements')
export class AnnouncementsController {
    constructor(private readonly announcementsService: AnnouncementsService) { }


    // ---------------- Public List ----------------

    @Public()
    @Get('public')
    @ApiRoute({
        summary: 'List public announcements',
        auth: false,
        responseType: PublicAnnouncementResponse,
        responseIsArray: true,
    })
    listPublic(): Promise<PublicAnnouncementResponse[]> {
        return this.announcementsService.listPublic();
    }
}
