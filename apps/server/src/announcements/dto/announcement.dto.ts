import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateAnnouncementDto {
    @ApiProperty({
        description: 'Announcement title',
        example: 'Blood donation camp',
    })
    @IsString()
    @Length(2, 160)
    title!: string;

    @ApiProperty({
        description: 'Announcement body',
        example: 'A local donation camp will be held this Friday.',
    })
    @IsString()
    @Length(2, 5000)
    body!: string;

    @ApiPropertyOptional({
        description: 'Whether the announcement is public',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;
}

export class UpdateAnnouncementDto {
    @ApiPropertyOptional({
        description: 'Announcement title',
        example: 'Updated donation camp',
    })
    @IsOptional()
    @IsString()
    @Length(2, 160)
    title?: string;

    @ApiPropertyOptional({
        description: 'Announcement body',
        example: 'Updated details for the donation camp.',
    })
    @IsOptional()
    @IsString()
    @Length(2, 5000)
    body?: string;

    @ApiPropertyOptional({
        description: 'Whether the announcement is public',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;
}
