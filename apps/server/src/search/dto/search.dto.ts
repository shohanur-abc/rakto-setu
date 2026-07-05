import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { requestUrgencyValues } from '../../common/utils/api-enums';
import { bloodGroupExamples } from '../../common/utils/blood-group';

export class SearchDonorsQueryDto extends PaginationQueryDto {
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

export class AvailabilitySummaryQueryDto {
    @ApiPropertyOptional({
        description: 'Location filter',
        example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a',
    })
    @IsOptional()
    @IsUUID()
    locationId?: string;
}

export class PublicRequestSearchQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional({
        description: 'Blood group filter',
        example: 'O+',
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
