import { BloodRequestResponse, PageResponse } from '@/common/dto/api-response.dto';
import { PaginationRequest } from '@/common/dto/pagination.dto';
import { requestStatusValues, requestUrgencyValues } from '@/common/utils/api-enums';
import { bloodGroupExamples } from '@/common/utils/blood-group';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, IsUUID, Length, Max, Min } from 'class-validator';



// ---------------- Shared ----------------

export class PublicRequestQueryRequest extends PaginationRequest {
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
}

export class AdminRequestQueryRequest extends PublicRequestQueryRequest {
    @ApiPropertyOptional({
        description: 'Request status filter',
        example: 'pending_review',
        enum: requestStatusValues,
    })
    @IsOptional()
    @IsIn(requestStatusValues)
    status?: string;
}

export type BloodRequestPageResponse = PageResponse<BloodRequestResponse>;

export class ConfirmedResponse {
    @ApiProperty({ example: true })
    confirmed!: boolean;
}



// ---------------- Public Requests ----------------

export class PublicRequestsRequest extends PublicRequestQueryRequest { }

export type PublicRequestsResponse = BloodRequestPageResponse;



// ---------------- Public Detail ----------------

export class PublicRequestDetailResponse extends BloodRequestResponse { }



// ---------------- Create Request ----------------

export class CreateBloodRequestRequest {
    @ApiProperty({
        description: 'Patient name; can differ from the account holder',
        example: 'Ayesha Khatun',
    })
    @IsString()
    @Length(2, 120)
    patientName!: string;

    @ApiPropertyOptional({
        description: 'Patient age',
        example: 42,
        minimum: 0,
        maximum: 120,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(120)
    patientAge?: number;

    @ApiProperty({
        description: 'Required blood group',
        example: 'B+',
        enum: bloodGroupExamples,
    })
    @IsIn(bloodGroupExamples)
    bloodGroup!: string;

    @ApiProperty({
        description: 'Location id where blood is needed',
        example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a',
    })
    @IsUUID()
    locationId!: string;

    @ApiPropertyOptional({
        description: 'Units needed',
        example: 1,
        minimum: 1,
        maximum: 10,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(10)
    unitsNeeded?: number;

    @ApiProperty({
        description: 'Hospital or clinic name where transfusion happens',
        example: 'Pabna General Hospital',
    })
    @IsString()
    @Length(2, 160)
    hospitalName!: string;

    @ApiProperty({
        description: 'Request urgency',
        example: 'urgent',
        enum: requestUrgencyValues,
    })
    @IsIn(requestUrgencyValues)
    urgency!: string;

    @ApiProperty({
        description: 'Deadline when blood is needed',
        example: '2026-08-15T10:00:00.000Z',
    })
    @IsDateString()
    neededBy!: string;

    @ApiPropertyOptional({
        description: 'Optional request details',
        example: 'Doctor requested donor before surgery.',
    })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class CreateBloodRequestResponse extends BloodRequestResponse { }



// ---------------- Own Requests ----------------

export class OwnRequestsRequest extends PublicRequestQueryRequest { }

export type OwnRequestsResponse = BloodRequestPageResponse;



// ---------------- Own Detail ----------------

export class RequestContactResponse {
    @ApiProperty({ example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a' })
    id!: string;

    @ApiProperty({ example: 'Ayesha Khatun' })
    fullName!: string;

    @ApiProperty({ example: '+8801711000001' })
    phone!: string;

    @ApiPropertyOptional({ example: 'ayesha@example.com', nullable: true })
    email!: string | null;
}

export class OwnRequestDetailResponse extends BloodRequestResponse {
    @ApiProperty({ type: () => [RequestContactResponse] })
    acceptedDonors?: RequestContactResponse[];

    @ApiPropertyOptional({ type: () => RequestContactResponse, nullable: true })
    recipientContact?: RequestContactResponse;
}



// ---------------- Update Request ----------------

export class UpdateBloodRequestRequest {
    @ApiPropertyOptional({
        description: 'Patient name',
        example: 'Ayesha Khatun',
    })
    @IsOptional()
    @IsString()
    @Length(2, 120)
    patientName?: string;

    @ApiPropertyOptional({
        description: 'Patient age',
        example: 42,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(120)
    patientAge?: number;

    @ApiPropertyOptional({
        description: 'Units needed',
        example: 2,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(10)
    unitsNeeded?: number;

    @ApiPropertyOptional({
        description: 'Hospital name',
        example: 'Pabna General Hospital',
    })
    @IsOptional()
    @IsString()
    @Length(2, 160)
    hospitalName?: string;

    @ApiPropertyOptional({
        description: 'Request urgency',
        example: 'emergency',
        enum: requestUrgencyValues,
    })
    @IsOptional()
    @IsIn(requestUrgencyValues)
    urgency?: string;

    @ApiPropertyOptional({
        description: 'Deadline when blood is needed',
        example: '2026-08-15T10:00:00.000Z',
    })
    @IsOptional()
    @IsDateString()
    neededBy?: string;

    @ApiPropertyOptional({
        description: 'Optional request details',
        example: 'Updated ward information.',
    })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateBloodRequestResponse extends BloodRequestResponse { }



// ---------------- Cancel Request ----------------

export class CancelBloodRequestResponse extends BloodRequestResponse { }



// ---------------- Request Status ----------------

export class RequestStatusResponse {
    @ApiProperty({ example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a' })
    id!: string;

    @ApiProperty({ example: 'matched' })
    status!: string;

    @ApiProperty({ example: 2 })
    unitsNeeded!: number;

    @ApiProperty({ example: 1 })
    unitsFulfilled!: number;

    @ApiProperty({ example: '2026-07-04T10:00:00.000Z' })
    updatedAt!: string | Date;
}



// ---------------- Accepted Matches ----------------

export class MatchedDonorResponse {
    @ApiProperty({ example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a' })
    id!: string;

    @ApiProperty({ example: 'Abdul Karim' })
    fullName!: string;

    @ApiProperty({ example: '+8801711000001' })
    phone!: string;

    @ApiPropertyOptional({ example: 'donor@example.com', nullable: true })
    email!: string | null;

    @ApiPropertyOptional({ example: 'O+', nullable: true })
    bloodGroup!: string | null;
}

export class RequestMatchResponse {
    @ApiProperty({ example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a' })
    id!: string;

    @ApiProperty({ example: 'accepted' })
    status!: string;

    @ApiProperty({ example: false })
    donorConfirmedCompletion!: boolean;

    @ApiProperty({ example: false })
    recipientConfirmedCompletion!: boolean;

    @ApiProperty({ example: '2026-07-04T10:00:00.000Z' })
    respondedAt!: string | Date;

    @ApiProperty({ type: () => MatchedDonorResponse })
    donor!: MatchedDonorResponse;
}



// ---------------- Cancel Accepted Match ----------------

export class CancelAcceptedMatchRequest {
    @ApiPropertyOptional({
        description: 'Optional reason for cancelling this donor match',
        example: 'Patient arranged blood from another donor.',
    })
    @IsOptional()
    @IsString()
    cancelReason?: string;
}

export class CancelAcceptedMatchResponse {
    @ApiProperty({ example: true })
    cancelled!: boolean;

    @ApiProperty({ example: 'withdrawn' })
    status!: string;

    @ApiProperty({ example: '2026-07-04T10:00:00.000Z' })
    cancelledAt!: string | Date;
}



// ---------------- Confirm Completion ----------------

export class ConfirmRecipientCompletionRequest {
    @ApiPropertyOptional({
        description:
            'Accepted donor user id to confirm when multiple donors accepted',
        example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a',
    })
    @IsOptional()
    @IsUUID()
    donorId?: string;
}

export class ConfirmRecipientCompletionResponse extends ConfirmedResponse { }
