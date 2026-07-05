import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiRoute } from '../common/decorators/api-route.decorator';
import { LocationViewDto } from '../common/dto/api-response.dto';
import { Public } from '../common/decorators/public.decorator';
import { LocationsService } from './locations.service';

@ApiTags('Locations')
@Public()
@Controller('locations')
export class LocationsController {
    constructor(private readonly locationsService: LocationsService) { }


    // ---------------- List Locations ----------------

    @Get()
    @ApiRoute({
        summary: 'List local unions and villages',
        auth: false,
        responseType: LocationViewDto,
        responseIsArray: true,
    })
    list() {
        return this.locationsService.list();
    }
}
