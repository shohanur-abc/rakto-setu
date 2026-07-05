import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ApiRoute } from '../common/decorators/api-route.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import type { AuthUser } from '../common/types/auth-user';
import {
    ConfirmDonorCompletionDto,
    DonorRequestsQueryDto,
    RegisterDonorDto,
    UpdateAvailabilityDto,
    UpdateDonorProfileDto,
} from './dto/donor.dto';
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
    })
    register(@CurrentUser() user: AuthUser, @Body() dto: RegisterDonorDto) {
        return this.donorsService.register(user, dto);
    }


    // ---------------- Get Profile ----------------

    @Roles(Role.DONOR)
    @Get('profile')
    @ApiRoute({ summary: 'Get own donor profile', notFound: true })
    getProfile(@CurrentUser() user: AuthUser) {
        return this.donorsService.getProfile(user);
    }


    // ---------------- Update Profile ----------------

    @Roles(Role.DONOR)
    @Put('profile')
    @ApiRoute({ summary: 'Update own donor profile', notFound: true })
    updateProfile(
        @CurrentUser() user: AuthUser,
        @Body() dto: UpdateDonorProfileDto,
    ) {
        return this.donorsService.updateProfile(user, dto);
    }


    // ---------------- Update Availability ----------------

    @Roles(Role.DONOR)
    @Patch('availability')
    @ApiRoute({ summary: 'Toggle donor availability', notFound: true })
    updateAvailability(
        @CurrentUser() user: AuthUser,
        @Body() dto: UpdateAvailabilityDto,
    ) {
        return this.donorsService.updateAvailability(user, dto);
    }


    // ---------------- Matching Requests ----------------

    @Roles(Role.DONOR)
    @Get('requests')
    @ApiRoute({ summary: 'View matching open blood requests' })
    getMatchingRequests(
        @CurrentUser() user: AuthUser,
        @Query() query: DonorRequestsQueryDto,
    ) {
        return this.donorsService.getMatchingRequests(user, query);
    }


    // ---------------- Accept Request ----------------

    @Roles(Role.DONOR)
    @Post('requests/:id/accept')
    @ApiRoute({
        summary: 'Accept a blood request',
        status: 201,
        notFound: true,
    })
    acceptRequest(
        @CurrentUser() user: AuthUser,
        @Param('id') requestId: string,
    ) {
        return this.donorsService.acceptRequest(user, requestId);
    }


    // ---------------- Decline Request ----------------

    @Roles(Role.DONOR)
    @Post('requests/:id/decline')
    @ApiRoute({
        summary: 'Decline a blood request',
        status: 201,
        notFound: true,
    })
    declineRequest(
        @CurrentUser() user: AuthUser,
        @Param('id') requestId: string,
    ) {
        return this.donorsService.declineRequest(user, requestId);
    }


    // ---------------- Confirm Completion ----------------

    @Roles(Role.DONOR)
    @Post('requests/:id/confirm-completion')
    @ApiRoute({ summary: 'Confirm donor-side completion', status: 201 })
    confirmCompletion(
        @CurrentUser() user: AuthUser,
        @Param('id') requestId: string,
        @Body() dto: ConfirmDonorCompletionDto,
    ) {
        return this.donorsService.confirmCompletion(user, requestId, dto);
    }


    // ---------------- Donation History ----------------

    @Roles(Role.DONOR)
    @Get('donations')
    @ApiRoute({ summary: 'View own donation history' })
    getDonations(@CurrentUser() user: AuthUser) {
        return this.donorsService.getDonations(user);
    }


    // ---------------- Eligibility ----------------

    @Roles(Role.DONOR)
    @Get('eligibility')
    @ApiRoute({ summary: 'Get donor eligibility status' })
    getEligibility(@CurrentUser() user: AuthUser) {
        return this.donorsService.getEligibility(user);
    }
}
