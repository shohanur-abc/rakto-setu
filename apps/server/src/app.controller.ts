import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ApiRoute } from './common/decorators/api-route.decorator';
import { Public } from './common/decorators/public.decorator';
import { HealthResponse } from './app.dto';

@ApiTags('Health')
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }


    // ---------------- Health Check ----------------

    @Public()
    @Get()
    @ApiRoute({
        summary: 'API health check',
        auth: false,
        responseType: HealthResponse,
    })
    health(): HealthResponse {
        return this.appService.health();
    }
}
