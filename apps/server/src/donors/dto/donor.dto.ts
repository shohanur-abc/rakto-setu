import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsDateString,
    IsIn,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Max,
    Min,
} from 'class-validator';
import { bloodGroupExamples } from '../../common/utils/blood-group';

export class RegisterDonorDto {
    @ApiProperty({
        description: 'Donor blood group',
        example: 'O+',
        enum: bloodGroupExamples,
    })
    @IsIn(bloodGroupExamples)
    bloodGroup!: string;

    @ApiPropertyOptional({
        description: 'Location id where donor can usually donate',
        example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a',
    })
    @IsOptional()
    @IsUUID()
    locationId?: string;

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

export class UpdateDonorProfileDto {
    @ApiPropertyOptional({
        description: 'Donor blood group',
        example: 'A+',
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
        example: 'Avoid late-night calls',
    })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateAvailabilityDto {
    @ApiProperty({
        description: 'Whether the donor is currently willing to be contacted',
        example: true,
    })
    @IsBoolean()
    isAvailable!: boolean;
}

export class DonorRequestsQueryDto {
    @ApiPropertyOptional({
        description: 'Location filter',
        example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a',
    })
    @IsOptional()
    @IsUUID()
    locationId?: string;
}

export class ConfirmDonorCompletionDto {
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
