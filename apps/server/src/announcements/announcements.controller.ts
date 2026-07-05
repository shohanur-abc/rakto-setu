import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiRoute } from '../common/decorators/api-route.decorator';
import { AnnouncementViewDto } from '../common/dto/api-response.dto';
import { Public } from '../common/decorators/public.decorator';
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
        responseType: AnnouncementViewDto,
        responseIsArray: true,
    })
    listPublic() {
        return this.announcementsService.listPublic();
    }
}
