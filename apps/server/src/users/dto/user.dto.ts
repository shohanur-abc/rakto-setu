import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEmail,
    IsIn,
    IsOptional,
    IsString,
    IsUUID,
    Length,
} from 'class-validator';
import { bloodGroupExamples } from '../../common/utils/blood-group';

export class UpdateProfileDto {
    @ApiPropertyOptional({
        description: 'Updated full name',
        example: 'Md Rahim Uddin',
    })
    @IsOptional()
    @IsString()
    @Length(2, 120)
    fullName?: string;

    @ApiPropertyOptional({
        description: 'Updated email address',
        example: 'rahim@example.com',
    })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({
        description: 'Profile blood group',
        example: 'O+',
        enum: bloodGroupExamples,
    })
    @IsOptional()
    @IsIn(bloodGroupExamples)
    bloodGroup?: string;

    @ApiPropertyOptional({
        description: 'Profile location id',
        example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a',
    })
    @IsOptional()
    @IsUUID()
    locationId?: string;

    @ApiPropertyOptional({
        description: 'Preferred UI/message language',
        example: 'bn',
        enum: ['bn', 'en'],
    })
    @IsOptional()
    @IsIn(['bn', 'en'])
    preferredLanguage?: string;
}
