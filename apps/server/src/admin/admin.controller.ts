import { Body, Controller, Delete, Get, Header, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CreateAnnouncementRequest, CreateAnnouncementResponse } from '@/announcements/announcements.dto';
import { DeleteAnnouncementResponse } from '@/announcements/announcements.dto';
import { UpdateAnnouncementRequest, UpdateAnnouncementResponse } from '@/announcements/announcements.dto';
import { ApiRoute } from '@/common/decorators/api-route.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { SkipEnvelope } from '@/common/decorators/skip-envelope.decorator';
import { BloodRequestResponse, UserResponse } from '@/common/dto/api-response.dto';
import type { AuthUser } from '@/common/types/auth-user';
import { AssignDonorRequest, AssignDonorResponse } from './admin.dto';
import { CloseRequestRequest, CloseRequestResponse } from './admin.dto';
import { DashboardResponse } from './admin.dto';
import { DeleteUserResponse } from './admin.dto';
import { GetUserResponse } from './admin.dto';
import { ListRequestsRequest, ListRequestsResponse } from './admin.dto';
import { ListUsersRequest, ListUsersResponse } from './admin.dto';
import { ModerationResponse } from './admin.dto';
import { PendingDonorResponse } from './admin.dto';
import { PublishRequestResponse } from './admin.dto';
import { RejectRequestResponse } from './admin.dto';
import { ExportReportsRequest } from './admin.dto';
import { ReportsQueryRequest, ReportsResponse } from './admin.dto';
import { SettingsResponse, UpdateSettingsRequest } from './admin.dto';
import { UpdateUserStatusRequest, UpdateUserStatusResponse } from './admin.dto';
import { VerifyDonorRequest, VerifyDonorResponse } from './admin.dto';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }


    // ---------------- Dashboard ----------------

    @Get('dashboard')
    @ApiRoute({
        summary: 'Get admin dashboard metrics',
        responseType: DashboardResponse,
    })
    dashboard(): Promise<DashboardResponse> {
        return this.adminService.dashboard();
    }


    // ---------------- List Users ----------------

    @Get('users')
    @ApiRoute({
        summary: 'List and search users',
        responseType: UserResponse,
        paginated: true,
    })
    listUsers(@Query() query: ListUsersRequest): Promise<ListUsersResponse> {
        return this.adminService.listUsers(query);
    }


    // ---------------- Get User ----------------

    @Get('users/:id')
    @ApiRoute({
        summary: 'View a user',
        notFound: true,
        responseType: GetUserResponse,
    })
    getUser(@Param('id') id: string): Promise<GetUserResponse> {
        return this.adminService.getUser(id);
    }


    // ---------------- Update User ----------------

    @Patch('users/:id/status')
    @ApiRoute({
        summary: 'Suspend or reactivate a user',
        notFound: true,
        responseType: UpdateUserStatusResponse,
    })
    updateUserStatus(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
        @Body() dto: UpdateUserStatusRequest,
    ): Promise<UpdateUserStatusResponse> {
        return this.adminService.updateUserStatus(user, id, dto);
    }


    // ---------------- Delete User ----------------

    @Delete('users/:id')
    @ApiRoute({
        summary: 'Remove a user',
        notFound: true,
        responseType: DeleteUserResponse,
    })
    deleteUser(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
    ): Promise<DeleteUserResponse> {
        return this.adminService.deleteUser(user, id);
    }


    // ---------------- Pending Donors ----------------

    @Get('donors/pending')
    @ApiRoute({
        summary: 'List donors awaiting verification',
        responseType: PendingDonorResponse,
        responseIsArray: true,
    })
    pendingDonors(): Promise<PendingDonorResponse[]> {
        return this.adminService.pendingDonors();
    }


    // ---------------- Verify Donor ----------------

    @Patch('donors/:id/verify')
    @ApiRoute({
        summary: 'Approve or reject donor verification',
        notFound: true,
        responseType: VerifyDonorResponse,
    })
    verifyDonor(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
        @Body() dto: VerifyDonorRequest,
    ): Promise<VerifyDonorResponse> {
        return this.adminService.verifyDonor(user, id, dto);
    }


    // ---------------- List Requests ----------------

    @Get('requests')
    @ApiRoute({
        summary: 'List all blood requests',
        responseType: BloodRequestResponse,
        paginated: true,
    })
    listRequests(@Query() query: ListRequestsRequest): Promise<ListRequestsResponse> {
        return this.adminService.listRequests(query);
    }


    // ---------------- Publish Request ----------------

    @Patch('requests/:id/publish')
    @ApiRoute({
        summary: 'Publish a reviewed request',
        notFound: true,
        responseType: PublishRequestResponse,
    })
    publishRequest(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
    ): Promise<PublishRequestResponse> {
        return this.adminService.publishRequest(user, id);
    }


    // ---------------- Reject Request ----------------

    @Patch('requests/:id/reject')
    @ApiRoute({
        summary: 'Reject a request under review',
        notFound: true,
        responseType: RejectRequestResponse,
    })
    rejectRequest(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
    ): Promise<RejectRequestResponse> {
        return this.adminService.rejectRequest(user, id);
    }


    // ---------------- Assign Donor ----------------

    @Patch('requests/:id/assign')
    @ApiRoute({
        summary: 'Assign a donor to a request',
        notFound: true,
        responseType: AssignDonorResponse,
    })
    assignDonor(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
        @Body() dto: AssignDonorRequest,
    ): Promise<AssignDonorResponse> {
        return this.adminService.assignDonor(user, id, dto);
    }


    // ---------------- Close Request ----------------

    @Patch('requests/:id/close')
    @ApiRoute({
        summary: 'Force-close a request',
        notFound: true,
        responseType: CloseRequestResponse,
    })
    closeRequest(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
        @Body() dto: CloseRequestRequest,
    ): Promise<CloseRequestResponse> {
        return this.adminService.closeRequest(user, id, dto);
    }


    // ---------------- Reports ----------------

    @Get('reports')
    @ApiRoute({ summary: 'Generate reports', responseType: ReportsResponse })
    reports(@Query() query: ReportsQueryRequest): Promise<ReportsResponse> {
        return this.adminService.reports(query);
    }


    // ---------------- Export Reports ----------------

    @Get('reports/export')
    @SkipEnvelope()
    @Header('Content-Type', 'text/csv; charset=utf-8')
    @Header(
        'Content-Disposition',
        'attachment; filename="rakto-setu-report.csv"',
    )
    @ApiRoute({
        summary: 'Export report as CSV',
        dataSchema: { type: 'string' },
        envelope: false,
    })
    exportReports(@Query() query: ExportReportsRequest): Promise<string> {
        return this.adminService.exportReports(query);
    }


    // ---------------- Create Announcement ----------------

    @Post('announcements')
    @ApiRoute({
        summary: 'Create an announcement',
        status: 201,
        responseType: CreateAnnouncementResponse,
    })
    createAnnouncement(
        @CurrentUser() user: AuthUser,
        @Body() dto: CreateAnnouncementRequest,
    ): Promise<CreateAnnouncementResponse> {
        return this.adminService.createAnnouncement(user, dto);
    }


    // ---------------- Update Announcement ----------------

    @Put('announcements/:id')
    @ApiRoute({
        summary: 'Edit an announcement',
        notFound: true,
        responseType: UpdateAnnouncementResponse,
    })
    updateAnnouncement(
        @Param('id') id: string,
        @Body() dto: UpdateAnnouncementRequest,
    ): Promise<UpdateAnnouncementResponse> {
        return this.adminService.updateAnnouncement(id, dto);
    }


    // ---------------- Delete Announcement ----------------

    @Delete('announcements/:id')
    @ApiRoute({
        summary: 'Delete an announcement',
        notFound: true,
        responseType: DeleteAnnouncementResponse,
    })
    deleteAnnouncement(@Param('id') id: string): Promise<DeleteAnnouncementResponse> {
        return this.adminService.deleteAnnouncement(id);
    }


    // ---------------- Moderation ----------------

    @Get('reports/moderation')
    @ApiRoute({
        summary: 'Review reported or flagged content',
        responseType: ModerationResponse,
        responseIsArray: true,
    })
    moderationQueue(): ModerationResponse[] {
        return this.adminService.moderationQueue();
    }


    // ---------------- Settings ----------------

    @Get('settings')
    @ApiRoute({ summary: 'Read system settings', responseType: SettingsResponse })
    getSettings(): Promise<SettingsResponse> {
        return this.adminService.getSettings();
    }


    // ---------------- Update Settings ----------------

    @Put('settings')
    @ApiRoute({
        summary: 'Update system settings',
        responseType: SettingsResponse,
    })
    updateSettings(
        @CurrentUser() user: AuthUser,
        @Body() dto: UpdateSettingsRequest,
    ): Promise<SettingsResponse> {
        return this.adminService.updateSettings(user, dto);
    }
}
