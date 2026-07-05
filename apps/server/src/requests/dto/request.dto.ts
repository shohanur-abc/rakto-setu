import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsDateString,
    IsIn,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Length,
    Max,
    Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { bloodGroupExamples } from '../../common/utils/blood-group';
import {
    requestStatusValues,
    requestUrgencyValues,
} from '../../common/utils/api-enums';

export class CreateBloodRequestDto {
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
        description: 'Location id where blood is needed',
        example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a',
    })
    @IsUUID()
    locationId!: string;

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

export class UpdateBloodRequestDto {
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

export class PublicRequestQueryDto extends PaginationQueryDto {
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

export class AdminRequestQueryDto extends PublicRequestQueryDto {
    @ApiPropertyOptional({
        description: 'Request status filter',
        example: 'pending_review',
        enum: requestStatusValues,
    })
    @IsOptional()
    @IsIn(requestStatusValues)
    status?: string;
}

export class ConfirmRecipientCompletionDto {
    @ApiPropertyOptional({
        description:
            'Accepted donor user id to confirm when multiple donors accepted',
        example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a',
    })
    @IsOptional()
    @IsUUID()
    donorId?: string;
}
