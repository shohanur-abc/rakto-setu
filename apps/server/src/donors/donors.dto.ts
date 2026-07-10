import { LocationResponse } from '@/common/dto/api-response.dto';
import { bloodGroupExamples } from '@/common/utils/blood-group';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';



// ---------------- Shared ----------------

export class DonorProfileFieldsRequest {
    @ApiPropertyOptional({
        description:
            'Donor blood group. Optional if the user profile already has a blood group.',
        example: 'O+',
        enum: bloodGroupExamples,
    })
    @IsOptional()
    @IsIn(bloodGroupExamples)
    bloodGroup?: string;

    @ApiPropertyOptional({
        description: 'Last donation date if known',
        example: '2026-01-10',
    })
    @IsOptional()
    @IsDateString()
    lastDonationDate?: string;

    @ApiPropertyOptional({
        description: 'Optional medical/admin note',
        example: 'Prefers evening calls',
    })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class DonorProfileResponse {
    @ApiProperty({ example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a' })
    id!: string;

    @ApiProperty({ example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a' })
    userId!: string;

    @ApiProperty({ example: 'Abdul Karim' })
    fullName!: string;

    @ApiProperty({ example: '+8801711000001' })
    phone!: string;

    @ApiProperty({ example: 'O+' })
    bloodGroup!: string;

    @ApiProperty({ example: true })
    isAvailable!: boolean;

    @ApiProperty({ example: 'verified' })
    verification!: string;

    @ApiPropertyOptional({ example: '2026-01-10T00:00:00.000Z', nullable: true })
    lastDonationDate!: string | Date | null;

    @ApiPropertyOptional({ example: '2026-04-09T00:00:00.000Z', nullable: true })
    nextEligibleDate!: string | Date | null;

    @ApiProperty({ example: 3 })
    totalDonations!: number;

    @ApiPropertyOptional({ example: 'Prefers evening calls', nullable: true })
    notes!: string | null;
}



// ---------------- Register Donor ----------------

export class RegisterDonorRequest extends DonorProfileFieldsRequest {
    @ApiPropertyOptional({
        description: 'Location id where donor can usually donate',
        example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a',
    })
    @IsOptional()
    @IsUUID()
    locationId?: string;
}

export class RegisterDonorResponse extends DonorProfileResponse { }



// ---------------- Get Profile ----------------

export class GetDonorProfileResponse extends DonorProfileResponse { }



// ---------------- Update Profile ----------------

export class UpdateDonorProfileRequest extends DonorProfileFieldsRequest { }

export class UpdateDonorProfileResponse extends DonorProfileResponse { }



// ---------------- Update Availability ----------------

export class UpdateAvailabilityRequest {
    @ApiProperty({
        description: 'Whether the donor is currently willing to be contacted',
        example: true,
    })
    @IsBoolean()
    isAvailable!: boolean;
}

export class UpdateAvailabilityResponse extends DonorProfileResponse { }



// ---------------- Matching Requests ----------------

export class MatchingRequestsRequest {
    @ApiPropertyOptional({
        description: 'Location filter',
        example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a',
    })
    @IsOptional()
    @IsUUID()
    locationId?: string;
}

export class MatchingRequestsResponse {
    @ApiProperty({ example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a' })
    id!: string;

    @ApiProperty({ example: 'Ayesha Khatun' })
    patientName!: string;

    @ApiProperty({ example: 'B+' })
    bloodGroup!: string;

    @ApiProperty({ example: 2 })
    unitsNeeded!: number;

    @ApiProperty({ example: 'Pabna General Hospital' })
    hospitalName!: string;

    @ApiPropertyOptional({ type: () => LocationResponse, nullable: true })
    location!: LocationResponse | unknown | null;

    @ApiProperty({ example: 'urgent' })
    urgency!: string;

    @ApiProperty({ example: '2026-08-15T10:00:00.000Z' })
    neededBy!: string | Date;

    @ApiProperty({ example: 'published' })
    status!: string;
}



// ---------------- Accept Request ----------------

export class AcceptedRecipientContactResponse {
    @ApiProperty({ example: 'Ayesha Khatun' })
    fullName!: string;

    @ApiProperty({ example: '+8801711000001' })
    phone!: string;

    @ApiPropertyOptional({ example: 'ayesha@example.com', nullable: true })
    email!: string | null;
}

export class AcceptedRequestSummaryResponse {
    @ApiProperty({ example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a' })
    id!: string;

    @ApiProperty({ example: 'Ayesha Khatun' })
    patientName!: string;

    @ApiProperty({ type: () => AcceptedRecipientContactResponse })
    recipientContact!: AcceptedRecipientContactResponse;
}

export class AcceptRequestResponse {
    @ApiProperty({ example: true })
    accepted!: boolean;

    @ApiProperty({ type: () => AcceptedRequestSummaryResponse })
    request!: AcceptedRequestSummaryResponse;
}



// ---------------- Accepted Requests ----------------

export class AcceptedRequestHistoryResponse {
    @ApiProperty({ example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a' })
    id!: string;

    @ApiProperty({ example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a' })
    requestId!: string;

    @ApiProperty({ example: 'Ayesha Khatun' })
    patientName!: string;

    @ApiProperty({ example: 'B+' })
    bloodGroup!: string;

    @ApiProperty({ example: 2 })
    unitsNeeded!: number;

    @ApiProperty({ example: 0 })
    unitsFulfilled!: number;

    @ApiProperty({ example: 'Pabna General Hospital' })
    hospitalName!: string;

    @ApiPropertyOptional({ type: () => LocationResponse, nullable: true })
    location!: LocationResponse | unknown | null;

    @ApiProperty({ example: 'urgent' })
    urgency!: string;

    @ApiProperty({ example: '2026-08-15T10:00:00.000Z' })
    neededBy!: string | Date;

    @ApiProperty({ example: 'matched' })
    status!: string;

    @ApiProperty({ example: 'accepted' })
    responseStatus!: string;

    @ApiProperty({ example: '2026-07-04T10:00:00.000Z' })
    respondedAt!: string | Date;

    @ApiProperty({ example: false })
    donorConfirmedCompletion!: boolean;

    @ApiProperty({ example: false })
    recipientConfirmedCompletion!: boolean;

    @ApiProperty({ type: () => AcceptedRecipientContactResponse })
    recipientContact!: AcceptedRecipientContactResponse;
}



// ---------------- Decline Request ----------------

export class DeclineRequestResponse {
    @ApiProperty({ example: true })
    declined!: boolean;
}



// ---------------- Cancel Accepted Request ----------------

export class CancelDonorAcceptedRequestRequest {
    @ApiPropertyOptional({
        description: 'Optional reason for withdrawing from the accepted request',
        example: 'I am no longer available at the requested time.',
    })
    @IsOptional()
    @IsString()
    cancelReason?: string;
}

export class CancelDonorAcceptedRequestResponse {
    @ApiProperty({ example: true })
    cancelled!: boolean;

    @ApiProperty({ example: 'withdrawn' })
    status!: string;

    @ApiProperty({ example: '2026-07-04T10:00:00.000Z' })
    cancelledAt!: string | Date;
}



// ---------------- Confirm Completion ----------------

export class ConfirmDonorCompletionRequest {
    @ApiPropertyOptional({
        description: 'Units donated',
        example: 1,
        minimum: 1,
        maximum: 4,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(4)
    units?: number;
}

export class ConfirmDonorCompletionResponse {
    @ApiProperty({ example: true })
    confirmed!: boolean;
}



// ---------------- Donation History ----------------

export class DonationHistoryResponse {
    @ApiProperty({ example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a' })
    id!: string;

    @ApiProperty({ example: '2026-07-04T10:00:00.000Z' })
    donationDate!: string | Date;

    @ApiProperty({ example: 1 })
    units!: number;

    @ApiProperty({ example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a' })
    requestId!: string | null;

    @ApiPropertyOptional({ example: 'Ayesha Khatun', nullable: true })
    patientName!: string | null;

    @ApiProperty({ example: '2026-07-04T10:00:00.000Z' })
    createdAt!: string | Date;
}



// ---------------- Eligibility ----------------

export class DonorEligibilityResponse {
    @ApiProperty({ example: true })
    eligible!: boolean;

    @ApiProperty({ example: true })
    isAvailable!: boolean;

    @ApiProperty({ example: 'verified' })
    verification!: string;

    @ApiProperty({ example: false })
    hasActiveCommitment!: boolean;

    @ApiPropertyOptional({ example: '2026-08-15T00:00:00.000Z', nullable: true })
    nextEligibleDate!: string | Date | null;
}
