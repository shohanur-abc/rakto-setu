import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ApiRoute } from '../common/decorators/api-route.decorator';
import { Public } from '../common/decorators/public.decorator';
import {
    AvailabilitySummaryQueryDto,
    SearchDonorsQueryDto,
} from './dto/search.dto';
import { SearchService } from './search.service';
import {
    AvailabilitySummaryItemDto,
    DonorSearchItemDto,
} from '../common/dto/api-response.dto';

@ApiTags('Search')
@Public()
@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }


    // ---------------- Search Donors ----------------

    @Get('donors')
    @Throttle({ default: { limit: 30, ttl: 60_000 } })
    @ApiRoute({
        summary: 'Search available donors without contact details',
        auth: false,
        tooManyRequests: true,
        responseType: DonorSearchItemDto,
        paginated: true,
    })
    searchDonors(@Query() query: SearchDonorsQueryDto) {
        return this.searchService.searchDonors(query);
    }


    // ---------------- Availability Summary ----------------

    @Get('availability-summary')
    @Throttle({ default: { limit: 60, ttl: 60_000 } })
    @ApiRoute({
        summary: 'Get availability summary by blood group',
        auth: false,
        tooManyRequests: true,
        responseType: AvailabilitySummaryItemDto,
        responseIsArray: true,
    })
    availabilitySummary(@Query() query: AvailabilitySummaryQueryDto) {
        return this.searchService.availabilitySummary(query);
    }
}
