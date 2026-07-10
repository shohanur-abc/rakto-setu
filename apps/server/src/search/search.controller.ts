import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ApiRoute } from '@/common/decorators/api-route.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { AvailabilitySummaryRequest, AvailabilitySummaryResponse } from './search.dto';
import { DonorSearchItemResponse, SearchDonorsRequest, SearchDonorsResponse } from './search.dto';
import { SearchService } from './search.service';

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
        responseType: DonorSearchItemResponse,
        paginated: true,
    })
    searchDonors(@Query() query: SearchDonorsRequest): Promise<SearchDonorsResponse> {
        return this.searchService.searchDonors(query);
    }


    // ---------------- Availability Summary ----------------

    @Get('availability-summary')
    @Throttle({ default: { limit: 60, ttl: 60_000 } })
    @ApiRoute({
        summary: 'Get availability summary by blood group',
        auth: false,
        tooManyRequests: true,
        responseType: AvailabilitySummaryResponse,
        responseIsArray: true,
    })
    availabilitySummary(
        @Query() query: AvailabilitySummaryRequest,
    ): Promise<AvailabilitySummaryResponse[]> {
        return this.searchService.availabilitySummary(query);
    }
}
