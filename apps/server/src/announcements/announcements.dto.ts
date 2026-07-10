import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';



// ---------------- Shared ----------------

export class AnnouncementResponse {
    @ApiProperty({ example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a' })
    id!: string;

    @ApiProperty({ example: 'Verified donor drive this Friday' })
    title!: string;

    @ApiProperty({
        example: 'Local volunteers will help verify donor profiles.',
    })
    body!: string;

    @ApiProperty({ example: true })
    isPublished!: boolean;

    @ApiProperty({ example: '2026-07-04T10:00:00.000Z' })
    createdAt!: string | Date;

    @ApiProperty({ example: '2026-07-04T10:00:00.000Z' })
    updatedAt!: string | Date;
}



// ---------------- Public List ----------------

export class PublicAnnouncementResponse extends AnnouncementResponse { }



// ---------------- Create Announcement ----------------

export class CreateAnnouncementRequest {
    @ApiProperty({
        description: 'Announcement title',
        example: 'Verified donor drive this Friday',
    })
    @IsString()
    @Length(2, 160)
    title!: string;

    @ApiProperty({
        description: 'Announcement body',
        example: 'Local volunteers will help verify donor profiles.',
    })
    @IsString()
    @Length(2, 5000)
    body!: string;

    @ApiPropertyOptional({
        description: 'Whether announcement is visible publicly',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;
}

export class CreateAnnouncementResponse extends AnnouncementResponse { }



// ---------------- Update Announcement ----------------

export class UpdateAnnouncementRequest {
    @ApiPropertyOptional({
        description: 'Announcement title',
        example: 'Verified donor drive this Friday',
    })
    @IsOptional()
    @IsString()
    @Length(2, 160)
    title?: string;

    @ApiPropertyOptional({
        description: 'Announcement body',
        example: 'Local volunteers will help verify donor profiles.',
    })
    @IsOptional()
    @IsString()
    @Length(2, 5000)
    body?: string;

    @ApiPropertyOptional({
        description: 'Whether announcement is visible publicly',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;
}

export class UpdateAnnouncementResponse extends AnnouncementResponse { }



// ---------------- Delete Announcement ----------------

export class DeleteAnnouncementResponse {
    @ApiProperty({ example: true })
    deleted!: boolean;
}
