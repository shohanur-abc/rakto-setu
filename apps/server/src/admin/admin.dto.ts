import { BloodRequestResponse, PageResponse, UserResponse } from '@/common/dto/api-response.dto';
import { PaginationRequest } from '@/common/dto/pagination.dto';
import { donorVerificationValues, requestStatusValues, requestUrgencyValues, userStatusValues } from '@/common/utils/api-enums';
import { bloodGroupExamples } from '@/common/utils/blood-group';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsObject, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';



// ---------------- Shared ----------------

export class AdminRequestStatusResponse {
    @ApiProperty({ example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a' })
    id!: string;

    @ApiProperty({ example: 'published' })
    status!: string;
}

export class AdminDonorResponse {
    @ApiProperty({ example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a' })
    id!: string;

    @ApiProperty({ example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a' })
    userId!: string;

    @ApiProperty({ example: 'Abdul Karim' })
    fullName!: string;

    @ApiPropertyOptional({ example: '+8801711000001' })
    phone?: string;

    @ApiProperty({ example: 'O+' })
    bloodGroup!: string;

    @ApiProperty({ example: 'unverified' })
    verification!: string;

    @ApiPropertyOptional({ example: 3 })
    totalDonations?: number;

    @ApiPropertyOptional({ example: '2026-07-04T10:00:00.000Z' })
    createdAt?: string | Date;
}

export type AdminUserPageResponse = PageResponse<UserResponse>;
export type AdminBloodRequestPageResponse = PageResponse<BloodRequestResponse>;



// ---------------- Dashboard ----------------

export class DashboardResponse {
    @ApiProperty({ example: 100 })
    users!: number;

    @ApiProperty({ example: 30 })
    activeDonors!: number;

    @ApiProperty({ example: 5 })
    pendingDonors!: number;

    @ApiProperty({ example: 4 })
    pendingRequests!: number;

    @ApiProperty({ example: 12 })
    publishedRequests!: number;

    @ApiProperty({ example: 20 })
    fulfilledRequests!: number;
}



// ---------------- List Users ----------------

export class ListUsersRequest extends PaginationRequest {
    @ApiPropertyOptional({
        description: 'Search by name, phone, or email',
        example: 'rahim',
    })
    @IsOptional()
    @IsString()
    search?: string;
}

export type ListUsersResponse = AdminUserPageResponse;



// ---------------- Get User ----------------

export class UserDonorProfileResponse {
    id!: string;
    bloodGroup!: string;
    isAvailable!: boolean;
    verification!: string;
    totalDonations!: number;
}

export class GetUserResponse extends UserResponse {
    @ApiPropertyOptional({ type: () => UserDonorProfileResponse, nullable: true })
    donorProfile!: UserDonorProfileResponse | null;
}



// ---------------- Update User Status ----------------

export class UpdateUserStatusRequest {
    @ApiProperty({
        description: 'New user status',
        example: 'suspended',
        enum: userStatusValues,
    })
    @IsIn(userStatusValues)
    status!: string;
}

export class UpdateUserStatusResponse extends UserResponse { }



// ---------------- Delete User ----------------

export class DeleteUserResponse {
    @ApiProperty({ example: true })
    deleted!: boolean;
}



// ---------------- Pending Donors ----------------

export class PendingDonorResponse extends AdminDonorResponse { }



// ---------------- Verify Donor ----------------

export class VerifyDonorRequest {
    @ApiProperty({
        description: 'Verification decision',
        example: 'verified',
        enum: donorVerificationValues,
    })
    @IsIn(donorVerificationValues)
    verification!: string;
}

export class VerifyDonorResponse extends AdminDonorResponse { }



// ---------------- List Requests ----------------

export class ListRequestsRequest extends PaginationRequest {
    @ApiPropertyOptional({
        description: 'Required blood group filter',
        example: 'B+',
        enum: bloodGroupExamples,
    })
    @IsOptional()
    @IsIn(bloodGroupExamples)
    bloodGroup?: string;

    @ApiPropertyOptional({
        description: 'Location filter',
        example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a',
    })
    @IsOptional()
    @IsUUID()
    locationId?: string;

    @ApiPropertyOptional({
        description: 'Urgency filter',
        example: 'urgent',
        enum: requestUrgencyValues,
    })
    @IsOptional()
    @IsIn(requestUrgencyValues)
    urgency?: string;

    @ApiPropertyOptional({
        description: 'Request status filter',
        example: 'pending_review',
        enum: requestStatusValues,
    })
    @IsOptional()
    @IsIn(requestStatusValues)
    status?: string;
}

export type ListRequestsResponse = AdminBloodRequestPageResponse;



// ---------------- Publish Request ----------------

export class PublishRequestResponse extends AdminRequestStatusResponse { }



// ---------------- Reject Request ----------------

export class RejectRequestResponse extends AdminRequestStatusResponse {
    @ApiProperty({ example: 'unfulfilled' })
    declare status: string;
}


// ---------------- Assign Donor ----------------

export class AssignDonorRequest {
    @ApiProperty({
        description: 'Donor user id',
        example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a',
    })
    @IsUUID()
    donorId!: string;
}

export class AssignDonorResponse {
    @ApiProperty({ example: true })
    assigned!: boolean;
}



// ---------------- Close Request ----------------

export class CloseRequestRequest {
    @ApiProperty({
        description: 'Closed status',
        example: 'unfulfilled',
        enum: ['fulfilled', 'cancelled', 'expired', 'unfulfilled'],
    })
    @IsIn(['fulfilled', 'cancelled', 'expired', 'unfulfilled'])
    status!: string;
}

export class CloseRequestResponse extends AdminRequestStatusResponse { }



// ---------------- Reports ----------------

export class ReportsQueryRequest {
    @ApiPropertyOptional({
        description: 'Start date',
        example: '2026-01-01',
    })
    @IsOptional()
    @IsDateString()
    from?: string;

    @ApiPropertyOptional({
        description: 'End date',
        example: '2026-12-31',
    })
    @IsOptional()
    @IsDateString()
    to?: string;

    @ApiPropertyOptional({
        description: 'Request status filter',
        example: 'fulfilled',
        enum: requestStatusValues,
    })
    @IsOptional()
    @IsIn(requestStatusValues)
    status?: string;
}

export class RequestsByStatusResponse {
    @ApiProperty({ example: 'fulfilled' })
    status!: string;

    @ApiProperty({ example: 4 })
    count!: number;
}

export class ReportsResponse {
    @ApiProperty({ type: () => [RequestsByStatusResponse] })
    requestsByStatus!: RequestsByStatusResponse[];

    @ApiProperty({ example: 10 })
    donations!: number;
}



// ---------------- Export Reports ----------------

export class ExportReportsRequest extends ReportsQueryRequest { }



// ---------------- Settings ----------------

export class UpdateSettingsRequest {
    @ApiPropertyOptional({
        description: 'Donation cooldown in days',
        example: 90,
        minimum: 30,
        maximum: 180,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(30)
    @Max(180)
    donorCooldownDays?: number;

    @ApiPropertyOptional({
        description: 'Additional settings metadata',
        example: { locale: 'bn' },
    })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, unknown>;
}

export class SettingsResponse {
    @ApiProperty({ example: 90 })
    donorCooldownDays!: number;

    @ApiPropertyOptional({ example: { locale: 'bn' }, nullable: true })
    metadata?: Record<string, unknown> | null;
}



// ---------------- Moderation ----------------

export class ModerationResponse { }
