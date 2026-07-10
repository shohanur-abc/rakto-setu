import { Body, Controller, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ApiRoute } from '@/common/decorators/api-route.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import type { AuthUser } from '@/common/types/auth-user';
import { AcceptRequestResponse } from './donors.dto';
import { AcceptedRequestHistoryResponse } from './donors.dto';
import { CancelDonorAcceptedRequestRequest, CancelDonorAcceptedRequestResponse } from './donors.dto';
import { ConfirmDonorCompletionRequest, ConfirmDonorCompletionResponse } from './donors.dto';
import { DeclineRequestResponse } from './donors.dto';
import { DonationHistoryResponse } from './donors.dto';
import { DonorEligibilityResponse } from './donors.dto';
import { GetDonorProfileResponse } from './donors.dto';
import { MatchingRequestsRequest, MatchingRequestsResponse } from './donors.dto';
import { RegisterDonorRequest, RegisterDonorResponse } from './donors.dto';
import { UpdateAvailabilityRequest, UpdateAvailabilityResponse } from './donors.dto';
import { UpdateDonorProfileRequest, UpdateDonorProfileResponse } from './donors.dto';
import { DonorsService } from './donors.service';

@ApiTags('Donors')
@Controller('donors')
export class DonorsController {
    constructor(private readonly donorsService: DonorsService) { }


    // ---------------- Register Donor ----------------

    @Post('register')
    @ApiRoute({
        summary: 'Register current user as a donor',
        status: 201,
        conflict: true,
        responseType: RegisterDonorResponse,
    })
    register(
        @CurrentUser() user: AuthUser,
        @Body() dto: RegisterDonorRequest,
    ): Promise<RegisterDonorResponse> {
        return this.donorsService.register(user, dto);
    }


    // ---------------- Get Profile ----------------

    @Roles(Role.DONOR)
    @Get('profile')
    @ApiRoute({
        summary: 'Get own donor profile',
        notFound: true,
        responseType: GetDonorProfileResponse,
    })
    getProfile(@CurrentUser() user: AuthUser): Promise<GetDonorProfileResponse> {
        return this.donorsService.getProfile(user);
    }


    // ---------------- Update Profile ----------------

    @Roles(Role.DONOR)
    @Put('profile')
    @ApiRoute({
        summary: 'Update own donor profile',
        notFound: true,
        responseType: UpdateDonorProfileResponse,
    })
    updateProfile(
        @CurrentUser() user: AuthUser,
        @Body() dto: UpdateDonorProfileRequest,
    ): Promise<UpdateDonorProfileResponse> {
        return this.donorsService.updateProfile(user, dto);
    }


    // ---------------- Update Availability ----------------

    @Roles(Role.DONOR)
    @Patch('availability')
    @ApiRoute({
        summary: 'Toggle donor availability',
        notFound: true,
        responseType: UpdateAvailabilityResponse,
    })
    updateAvailability(
        @CurrentUser() user: AuthUser,
        @Body() dto: UpdateAvailabilityRequest,
    ): Promise<UpdateAvailabilityResponse> {
        return this.donorsService.updateAvailability(user, dto);
    }


    // ---------------- Matching Requests ----------------

    @Roles(Role.DONOR)
    @Get('requests')
    @ApiRoute({
        summary: 'View matching open blood requests',
        responseType: MatchingRequestsResponse,
        responseIsArray: true,
    })
    getMatchingRequests(
        @CurrentUser() user: AuthUser,
        @Query() query: MatchingRequestsRequest,
    ): Promise<MatchingRequestsResponse[]> {
        return this.donorsService.getMatchingRequests(user, query);
    }


    // ---------------- Accept Request ----------------

    @Roles(Role.DONOR)
    @Post('requests/:id/accept')
    @ApiRoute({
        summary: 'Accept a blood request',
        status: 201,
        notFound: true,
        responseType: AcceptRequestResponse,
    })
    acceptRequest(
        @CurrentUser() user: AuthUser,
        @Param('id') requestId: string,
    ): Promise<AcceptRequestResponse> {
        return this.donorsService.acceptRequest(user, requestId);
    }


    // ---------------- Accepted Requests ----------------

    @Roles(Role.DONOR)
    @Get('accepted-requests')
    @ApiRoute({
        summary: 'View own accepted blood requests',
        responseType: AcceptedRequestHistoryResponse,
        responseIsArray: true,
    })
    getAcceptedRequests(
        @CurrentUser() user: AuthUser,
    ): Promise<AcceptedRequestHistoryResponse[]> {
        return this.donorsService.getAcceptedRequests(user);
    }


    // ---------------- Decline Request ----------------

    @Roles(Role.DONOR)
    @Post('requests/:id/decline')
    @ApiRoute({
        summary: 'Decline a blood request',
        status: 201,
        notFound: true,
        responseType: DeclineRequestResponse,
    })
    declineRequest(
        @CurrentUser() user: AuthUser,
        @Param('id') requestId: string,
    ): Promise<DeclineRequestResponse> {
        return this.donorsService.declineRequest(user, requestId);
    }


    // ---------------- Cancel Accepted Request ----------------

    @Roles(Role.DONOR)
    @Post('requests/:id/cancel')
    @ApiRoute({
        summary: 'Cancel own accepted blood request',
        status: 201,
        notFound: true,
        responseType: CancelDonorAcceptedRequestResponse,
    })
    cancelAcceptedRequest(
        @CurrentUser() user: AuthUser,
        @Param('id') requestId: string,
        @Body() dto: CancelDonorAcceptedRequestRequest,
    ): Promise<CancelDonorAcceptedRequestResponse> {
        return this.donorsService.cancelAcceptedRequest(user, requestId, dto);
    }


    // ---------------- Confirm Completion ----------------

    @Roles(Role.DONOR)
    @Post('requests/:id/confirm-completion')
    @ApiRoute({
        summary: 'Confirm donor-side completion',
        status: 201,
        responseType: ConfirmDonorCompletionResponse,
    })
    confirmCompletion(
        @CurrentUser() user: AuthUser,
        @Param('id') requestId: string,
        @Body() dto: ConfirmDonorCompletionRequest,
    ): Promise<ConfirmDonorCompletionResponse> {
        return this.donorsService.confirmCompletion(user, requestId, dto);
    }


    // ---------------- Donation History ----------------

    @Roles(Role.DONOR)
    @Get('donations')
    @ApiRoute({
        summary: 'View own donation history',
        responseType: DonationHistoryResponse,
        responseIsArray: true,
    })
    getDonations(@CurrentUser() user: AuthUser): Promise<DonationHistoryResponse[]> {
        return this.donorsService.getDonations(user);
    }


    // ---------------- Eligibility ----------------

    @Roles(Role.DONOR)
    @Get('eligibility')
    @ApiRoute({
        summary: 'Get donor eligibility status',
        responseType: DonorEligibilityResponse,
    })
    getEligibility(@CurrentUser() user: AuthUser): Promise<DonorEligibilityResponse> {
        return this.donorsService.getEligibility(user);
    }
}
