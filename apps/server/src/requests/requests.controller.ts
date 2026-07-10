import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ApiRoute } from '@/common/decorators/api-route.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import type { AuthUser } from '@/common/types/auth-user';
import { BloodRequestResponse } from '@/common/dto/api-response.dto';
import { CancelAcceptedMatchRequest, CancelAcceptedMatchResponse } from './requests.dto';
import { CancelBloodRequestResponse } from './requests.dto';
import { ConfirmRecipientCompletionRequest, ConfirmRecipientCompletionResponse } from './requests.dto';
import { CreateBloodRequestRequest, CreateBloodRequestResponse } from './requests.dto';
import { OwnRequestDetailResponse } from './requests.dto';
import { OwnRequestsRequest, OwnRequestsResponse } from './requests.dto';
import { PublicRequestDetailResponse } from './requests.dto';
import { PublicRequestsRequest, PublicRequestsResponse } from './requests.dto';
import { RequestMatchResponse } from './requests.dto';
import { RequestStatusResponse } from './requests.dto';
import { UpdateBloodRequestRequest, UpdateBloodRequestResponse } from './requests.dto';
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
        responseType: BloodRequestResponse,
        paginated: true,
    })
    listPublic(@Query() query: PublicRequestsRequest): Promise<PublicRequestsResponse> {
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
        responseType: PublicRequestDetailResponse,
    })
    getPublic(@Param('id') id: string): Promise<PublicRequestDetailResponse> {
        return this.requestsService.getPublic(id);
    }


    // ---------------- Create Request ----------------

    @Roles(Role.RECIPIENT, Role.DONOR)
    @Post()
    @ApiRoute({
        summary: 'Create a blood request',
        status: 201,
        responseType: CreateBloodRequestResponse,
    })
    create(
        @CurrentUser() user: AuthUser,
        @Body() dto: CreateBloodRequestRequest,
    ): Promise<CreateBloodRequestResponse> {
        return this.requestsService.create(user, dto);
    }


    // ---------------- Own Requests ----------------

    @Roles(Role.RECIPIENT, Role.DONOR)
    @Get()
    @ApiRoute({
        summary: 'List own blood requests',
        responseType: BloodRequestResponse,
        paginated: true,
    })
    listOwn(
        @CurrentUser() user: AuthUser,
        @Query() query: OwnRequestsRequest,
    ): Promise<OwnRequestsResponse> {
        return this.requestsService.listOwn(user, query);
    }


    // ---------------- Own Detail ----------------

    @Roles(Role.RECIPIENT, Role.DONOR)
    @Get(':id')
    @ApiRoute({
        summary: 'View own blood request detail',
        notFound: true,
        responseType: OwnRequestDetailResponse,
    })
    getOwn(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
    ): Promise<OwnRequestDetailResponse> {
        return this.requestsService.getOwn(user, id);
    }


    // ---------------- Update Request ----------------

    @Roles(Role.RECIPIENT, Role.DONOR)
    @Put(':id')
    @ApiRoute({
        summary: 'Edit own blood request',
        notFound: true,
        responseType: UpdateBloodRequestResponse,
    })
    update(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
        @Body() dto: UpdateBloodRequestRequest,
    ): Promise<UpdateBloodRequestResponse> {
        return this.requestsService.update(user, id, dto);
    }


    // ---------------- Cancel Request ----------------

    @Roles(Role.RECIPIENT, Role.DONOR)
    @Post(':id/cancel')
    @ApiRoute({
        summary: 'Cancel own blood request',
        status: 201,
        notFound: true,
        responseType: CancelBloodRequestResponse,
    })
    cancel(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
    ): Promise<CancelBloodRequestResponse> {
        return this.requestsService.cancel(user, id);
    }


    // ---------------- Request Status ----------------

    @Roles(Role.RECIPIENT, Role.DONOR)
    @Get(':id/status')
    @ApiRoute({
        summary: 'Track blood request status',
        notFound: true,
        responseType: RequestStatusResponse,
    })
    getStatus(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
    ): Promise<RequestStatusResponse> {
        return this.requestsService.getStatus(user, id);
    }


    // ---------------- Accepted Matches ----------------

    @Roles(Role.RECIPIENT, Role.DONOR)
    @Get(':id/matches')
    @ApiRoute({
        summary: 'View accepted donor matches',
        notFound: true,
        responseType: RequestMatchResponse,
        responseIsArray: true,
    })
    getMatches(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
    ): Promise<RequestMatchResponse[]> {
        return this.requestsService.getMatches(user, id);
    }


    // ---------------- Cancel Accepted Match ----------------

    @Roles(Role.RECIPIENT, Role.DONOR)
    @Post(':id/matches/:donorId/cancel')
    @ApiRoute({
        summary: 'Cancel an accepted donor match',
        status: 201,
        notFound: true,
        responseType: CancelAcceptedMatchResponse,
    })
    cancelMatch(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
        @Param('donorId') donorId: string,
        @Body() dto: CancelAcceptedMatchRequest,
    ): Promise<CancelAcceptedMatchResponse> {
        return this.requestsService.cancelMatch(user, id, donorId, dto);
    }


    // ---------------- Confirm Completion ----------------

    @Roles(Role.RECIPIENT, Role.DONOR)
    @Post(':id/confirm-completion')
    @ApiRoute({
        summary: 'Confirm recipient-side completion',
        status: 201,
        responseType: ConfirmRecipientCompletionResponse,
    })
    confirmCompletion(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
        @Body() dto: ConfirmRecipientCompletionRequest,
    ): Promise<ConfirmRecipientCompletionResponse> {
        return this.requestsService.confirmCompletion(user, id, dto);
    }
}
