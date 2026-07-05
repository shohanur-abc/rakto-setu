import {
    Body,
    Controller,
    Delete,
    Get,
    Header,
    Param,
    Patch,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
    CreateAnnouncementDto,
    UpdateAnnouncementDto,
} from '../announcements/dto/announcement.dto';
import { ApiRoute } from '../common/decorators/api-route.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { SkipEnvelope } from '../common/decorators/skip-envelope.decorator';
import type { AuthUser } from '../common/types/auth-user';
import { AdminRequestQueryDto } from '../requests/dto/request.dto';
import {
    AdminUserQueryDto,
    AssignDonorDto,
    CloseRequestDto,
    ReportsQueryDto,
    UpdateSettingsDto,
    UpdateUserStatusDto,
    VerifyDonorDto,
} from './dto/admin.dto';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }


    // ---------------- Dashboard ----------------

    @Get('dashboard')
    @ApiRoute({ summary: 'Get admin dashboard metrics' })
    dashboard() {
        return this.adminService.dashboard();
    }


    // ---------------- List Users ----------------

    @Get('users')
    @ApiRoute({ summary: 'List and search users' })
    listUsers(@Query() query: AdminUserQueryDto) {
        return this.adminService.listUsers(query);
    }


    // ---------------- Get User ----------------

    @Get('users/:id')
    @ApiRoute({ summary: 'View a user', notFound: true })
    getUser(@Param('id') id: string) {
        return this.adminService.getUser(id);
    }


    // ---------------- Update User ----------------

    @Patch('users/:id/status')
    @ApiRoute({ summary: 'Suspend or reactivate a user', notFound: true })
    updateUserStatus(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
        @Body() dto: UpdateUserStatusDto,
    ) {
        return this.adminService.updateUserStatus(user, id, dto);
    }


    // ---------------- Delete User ----------------

    @Delete('users/:id')
    @ApiRoute({ summary: 'Remove a user', notFound: true })
    deleteUser(@CurrentUser() user: AuthUser, @Param('id') id: string) {
        return this.adminService.deleteUser(user, id);
    }


    // ---------------- Pending Donors ----------------

    @Get('donors/pending')
    @ApiRoute({ summary: 'List donors awaiting verification' })
    pendingDonors() {
        return this.adminService.pendingDonors();
    }


    // ---------------- Verify Donor ----------------

    @Patch('donors/:id/verify')
    @ApiRoute({
        summary: 'Approve or reject donor verification',
        notFound: true,
    })
    verifyDonor(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
        @Body() dto: VerifyDonorDto,
    ) {
        return this.adminService.verifyDonor(user, id, dto);
    }


    // ---------------- List Requests ----------------

    @Get('requests')
    @ApiRoute({ summary: 'List all blood requests' })
    listRequests(@Query() query: AdminRequestQueryDto) {
        return this.adminService.listRequests(query);
    }


    // ---------------- Publish Request ----------------

    @Patch('requests/:id/publish')
    @ApiRoute({ summary: 'Publish a reviewed request', notFound: true })
    publishRequest(@CurrentUser() user: AuthUser, @Param('id') id: string) {
        return this.adminService.publishRequest(user, id);
    }


    // ---------------- Reject Request ----------------

    @Patch('requests/:id/reject')
    @ApiRoute({ summary: 'Reject a request under review', notFound: true })
    rejectRequest(@CurrentUser() user: AuthUser, @Param('id') id: string) {
        return this.adminService.rejectRequest(user, id);
    }


    // ---------------- Assign Donor ----------------

    @Patch('requests/:id/assign')
    @ApiRoute({ summary: 'Assign a donor to a request', notFound: true })
    assignDonor(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
        @Body() dto: AssignDonorDto,
    ) {
        return this.adminService.assignDonor(user, id, dto);
    }


    // ---------------- Close Request ----------------

    @Patch('requests/:id/close')
    @ApiRoute({ summary: 'Force-close a request', notFound: true })
    closeRequest(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
        @Body() dto: CloseRequestDto,
    ) {
        return this.adminService.closeRequest(user, id, dto);
    }


    // ---------------- Reports ----------------

    @Get('reports')
    @ApiRoute({ summary: 'Generate reports' })
    reports(@Query() query: ReportsQueryDto) {
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
    @ApiRoute({ summary: 'Export report as CSV' })
    exportReports(@Query() query: ReportsQueryDto) {
        return this.adminService.exportReports(query);
    }


    // ---------------- Create Announcement ----------------

    @Post('announcements')
    @ApiRoute({ summary: 'Create an announcement', status: 201 })
    createAnnouncement(
        @CurrentUser() user: AuthUser,
        @Body() dto: CreateAnnouncementDto,
    ) {
        return this.adminService.createAnnouncement(user, dto);
    }


    // ---------------- Update Announcement ----------------

    @Put('announcements/:id')
    @ApiRoute({ summary: 'Edit an announcement', notFound: true })
    updateAnnouncement(
        @Param('id') id: string,
        @Body() dto: UpdateAnnouncementDto,
    ) {
        return this.adminService.updateAnnouncement(id, dto);
    }


    // ---------------- Delete Announcement ----------------

    @Delete('announcements/:id')
    @ApiRoute({ summary: 'Delete an announcement', notFound: true })
    deleteAnnouncement(@Param('id') id: string) {
        return this.adminService.deleteAnnouncement(id);
    }


    // ---------------- Moderation ----------------

    @Get('reports/moderation')
    @ApiRoute({ summary: 'Review reported or flagged content' })
    moderationQueue() {
        return this.adminService.moderationQueue();
    }


    // ---------------- Settings ----------------

    @Get('settings')
    @ApiRoute({ summary: 'Read system settings' })
    getSettings() {
        return this.adminService.getSettings();
    }


    // ---------------- Update Settings ----------------

    @Put('settings')
    @ApiRoute({ summary: 'Update system settings' })
    updateSettings(
        @CurrentUser() user: AuthUser,
        @Body() dto: UpdateSettingsDto,
    ) {
        return this.adminService.updateSettings(user, dto);
    }
}
