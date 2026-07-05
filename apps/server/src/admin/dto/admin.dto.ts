import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsDateString,
    IsIn,
    IsInt,
    IsObject,
    IsOptional,
    IsString,
    IsUUID,
    Max,
    Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import {
    donorVerificationValues,
    requestStatusValues,
    userStatusValues,
} from '../../common/utils/api-enums';

export class AdminUserQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional({
        description: 'Search by name, phone, or email',
        example: 'rahim',
    })
    @IsOptional()
    @IsString()
    search?: string;
}

export class UpdateUserStatusDto {
    @ApiProperty({
        description: 'New user status',
        example: 'suspended',
        enum: userStatusValues,
    })
    @IsIn(userStatusValues)
    status!: string;
}

export class VerifyDonorDto {
    @ApiProperty({
        description: 'Verification decision',
        example: 'verified',
        enum: donorVerificationValues,
    })
    @IsIn(donorVerificationValues)
    verification!: string;
}

export class AssignDonorDto {
    @ApiProperty({
        description: 'Donor user id',
        example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a',
    })
    @IsUUID()
    donorId!: string;
}

export class CloseRequestDto {
    @ApiProperty({
        description: 'Closed status',
        example: 'unfulfilled',
        enum: ['fulfilled', 'cancelled', 'expired', 'unfulfilled'],
    })
    @IsIn(['fulfilled', 'cancelled', 'expired', 'unfulfilled'])
    status!: string;
}

export class ReportsQueryDto {
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

export class UpdateSettingsDto {
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
