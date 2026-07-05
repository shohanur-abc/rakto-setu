import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ApiRoute } from '../common/decorators/api-route.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import type { AuthUser } from '../common/types/auth-user';
import { BloodRequestViewDto } from '../common/dto/api-response.dto';
import {
    ConfirmRecipientCompletionDto,
    CreateBloodRequestDto,
    PublicRequestQueryDto,
    UpdateBloodRequestDto,
} from './dto/request.dto';
import { RequestsService } from './requests.service';

@ApiTags('Requests')
@Controller('requests')
export class RequestsController {
    constructor(private readonly requestsService: RequestsService) { }


    // ---------------- Public Requests ----------------

    @Public()
    @Get('public')
    @ApiRoute({
        summary: 'Browse published blood requests',
        auth: false,
        tooManyRequests: true,
        responseType: BloodRequestViewDto,
        paginated: true,
    })
    listPublic(@Query() query: PublicRequestQueryDto) {
        return this.requestsService.listPublic(query);
    }


    // ---------------- Public Detail ----------------

    @Public()
    @Get('public/:id')
    @ApiRoute({
        summary: 'View a published blood request',
        auth: false,
        notFound: true,
        tooManyRequests: true,
        responseType: BloodRequestViewDto,
    })
    getPublic(@Param('id') id: string) {
        return this.requestsService.getPublic(id);
    }


    // ---------------- Create Request ----------------

    @Roles(Role.RECIPIENT, Role.DONOR)
    @Post()
    @ApiRoute({
        summary: 'Create a blood request',
        status: 201,
        responseType: BloodRequestViewDto,
    })
    create(@CurrentUser() user: AuthUser, @Body() dto: CreateBloodRequestDto) {
        return this.requestsService.create(user, dto);
    }


    // ---------------- Own Requests ----------------

    @Roles(Role.RECIPIENT, Role.DONOR)
    @Get()
    @ApiRoute({
        summary: 'List own blood requests',
        responseType: BloodRequestViewDto,
        paginated: true,
    })
    listOwn(
        @CurrentUser() user: AuthUser,
        @Query() query: PublicRequestQueryDto,
    ) {
        return this.requestsService.listOwn(user, query);
    }


    // ---------------- Own Detail ----------------

    @Roles(Role.RECIPIENT, Role.DONOR)
    @Get(':id')
    @ApiRoute({
        summary: 'View own blood request detail',
        notFound: true,
        responseType: BloodRequestViewDto,
    })
    getOwn(@CurrentUser() user: AuthUser, @Param('id') id: string) {
        return this.requestsService.getOwn(user, id);
    }


    // ---------------- Update Request ----------------

    @Roles(Role.RECIPIENT, Role.DONOR)
    @Put(':id')
    @ApiRoute({
        summary: 'Edit own blood request',
        notFound: true,
        responseType: BloodRequestViewDto,
    })
    update(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
        @Body() dto: UpdateBloodRequestDto,
    ) {
        return this.requestsService.update(user, id, dto);
    }


    // ---------------- Cancel Request ----------------

    @Roles(Role.RECIPIENT, Role.DONOR)
    @Post(':id/cancel')
    @ApiRoute({
        summary: 'Cancel own blood request',
        status: 201,
        notFound: true,
        responseType: BloodRequestViewDto,
    })
    cancel(@CurrentUser() user: AuthUser, @Param('id') id: string) {
        return this.requestsService.cancel(user, id);
    }


    // ---------------- Request Status ----------------

    @Roles(Role.RECIPIENT, Role.DONOR)
    @Get(':id/status')
    @ApiRoute({ summary: 'Track blood request status', notFound: true })
    getStatus(@CurrentUser() user: AuthUser, @Param('id') id: string) {
        return this.requestsService.getStatus(user, id);
    }


    // ---------------- Accepted Matches ----------------

    @Roles(Role.RECIPIENT, Role.DONOR)
    @Get(':id/matches')
    @ApiRoute({ summary: 'View accepted donor matches', notFound: true })
    getMatches(@CurrentUser() user: AuthUser, @Param('id') id: string) {
        return this.requestsService.getMatches(user, id);
    }


    // ---------------- Confirm Completion ----------------

    @Roles(Role.RECIPIENT, Role.DONOR)
    @Post(':id/confirm-completion')
    @ApiRoute({ summary: 'Confirm recipient-side completion', status: 201 })
    confirmCompletion(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
        @Body() dto: ConfirmRecipientCompletionDto,
    ) {
        return this.requestsService.confirmCompletion(user, id, dto);
    }
}
