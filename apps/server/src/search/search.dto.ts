import { PageResponse } from '@/common/dto/api-response.dto';
import { PaginationRequest } from '@/common/dto/pagination.dto';
import { bloodGroupExamples } from '@/common/utils/blood-group';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';



// ---------------- Search Donors ----------------

export class DonorSearchItemResponse {
    @ApiProperty({ example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a' })
    id!: string;

    @ApiProperty({ example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a' })
    userId!: string;

    @ApiProperty({ example: 'Abdul Karim' })
    fullName!: string;

    @ApiProperty({ example: 'O+' })
    bloodGroup!: string;

    @ApiPropertyOptional({
        example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a',
        type: String,
        nullable: true,
    })
    locationId!: string | null;

    @ApiProperty({ example: 5 })
    totalDonations!: number;

    @ApiPropertyOptional({
        example: '2026-08-15T00:00:00.000Z',
        type: String,
        nullable: true,
    })
    nextEligibleDate!: string | Date | null;
}

export class SearchDonorsRequest extends PaginationRequest {
    @ApiProperty({
        description: 'Blood group to search for',
        example: 'O+',
        enum: bloodGroupExamples,
    })
    @IsIn(bloodGroupExamples)
    bloodGroup!: string;

    @ApiPropertyOptional({
        description: 'Location filter',
        example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a',
    })
    @IsOptional()
    @IsUUID()
    locationId?: string;
}

export type SearchDonorsResponse = PageResponse<DonorSearchItemResponse>;



// ---------------- Availability Summary ----------------

export class AvailabilitySummaryRequest {
    @ApiPropertyOptional({
        description: 'Location filter',
        example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a',
    })
    @IsOptional()
    @IsUUID()
    locationId?: string;
}

export class AvailabilitySummaryResponse {
    @ApiProperty({ example: 'O+' })
    bloodGroup!: string;

    @ApiProperty({ example: 14 })
    availableDonors!: number;
}
