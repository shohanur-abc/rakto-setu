import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PageMetaDto {
    @ApiProperty({ example: 1 })
    page!: number;

    @ApiProperty({ example: 20 })
    limit!: number;

    @ApiProperty({ example: 42 })
    total!: number;

    @ApiProperty({ example: 3 })
    totalPages!: number;
}

export class UserViewDto {
    @ApiProperty({ example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a' })
    id!: string;

    @ApiProperty({ example: 'Ayesha Khatun' })
    fullName!: string;

    @ApiProperty({ example: '+8801711000001' })
    phone!: string;

    @ApiPropertyOptional({
        example: 'ayesha@example.com',
        type: String,
        nullable: true,
    })
    email!: string | null;

    @ApiProperty({
        example: 'recipient',
        enum: ['recipient', 'donor', 'admin'],
    })
    role!: string;

    @ApiPropertyOptional({ example: 'B+', type: String, nullable: true })
    bloodGroup!: string | null;

    @ApiPropertyOptional({
        example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a',
        type: String,
        nullable: true,
    })
    locationId!: string | null;

    @ApiProperty({
        example: 'active',
        enum: ['active', 'pending_verification', 'suspended', 'deleted'],
    })
    status!: string;

    @ApiProperty({ example: true })
    phoneVerified!: boolean;

    @ApiProperty({ example: 'bn', enum: ['bn', 'en'] })
    preferredLanguage!: string;

    @ApiProperty({ example: '2026-07-04T10:00:00.000Z' })
    createdAt!: string;

    @ApiProperty({ example: '2026-07-04T10:00:00.000Z' })
    updatedAt!: string;
}

export class AuthLoginViewDto {
    @ApiProperty({ type: () => UserViewDto })
    user!: UserViewDto;

    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
    token!: string;
}

export class LocationViewDto {
    @ApiProperty({ example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a' })
    id!: string;

    @ApiProperty({ example: 'Pakshi' })
    name!: string;

    @ApiProperty({ example: 'village', enum: ['union', 'village', 'ward'] })
    type!: string;

    @ApiPropertyOptional({
        example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a',
        type: String,
        nullable: true,
    })
    parentId!: string | null;

    @ApiProperty({ example: '2026-07-04T10:00:00.000Z' })
    createdAt!: string;

    @ApiProperty({ example: '2026-07-04T10:00:00.000Z' })
    updatedAt!: string;
}

export class DonorSearchItemDto {
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
    nextEligibleDate!: string | null;
}

export class AvailabilitySummaryItemDto {
    @ApiProperty({ example: 'O+' })
    bloodGroup!: string;

    @ApiProperty({ example: 14 })
    availableDonors!: number;
}

export class BloodRequestViewDto {
    @ApiProperty({ example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a' })
    id!: string;

    @ApiProperty({ example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a' })
    recipientId!: string;

    @ApiProperty({ example: 'Ayesha Khatun' })
    patientName!: string;

    @ApiPropertyOptional({ example: 42, type: Number, nullable: true })
    patientAge!: number | null;

    @ApiProperty({ example: 'B+' })
    bloodGroup!: string;

    @ApiProperty({ example: 2 })
    unitsNeeded!: number;

    @ApiProperty({ example: 0 })
    unitsFulfilled!: number;

    @ApiProperty({ example: 'Pabna General Hospital' })
    hospitalName!: string;

    @ApiProperty({ example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a' })
    locationId!: string;

    @ApiPropertyOptional({ type: () => LocationViewDto, nullable: true })
    location!: LocationViewDto | null;

    @ApiProperty({
        example: 'urgent',
        enum: ['routine', 'urgent', 'emergency'],
    })
    urgency!: string;

    @ApiProperty({ example: '2026-07-05T10:00:00.000Z' })
    neededBy!: string;

    @ApiProperty({
        example: 'published',
        enum: [
            'draft',
            'pending_review',
            'published',
            'matched',
            'in_progress',
            'fulfilled',
            'cancelled',
            'expired',
            'unfulfilled',
        ],
    })
    status!: string;

    @ApiPropertyOptional({
        example: 'Surgery scheduled tomorrow.',
        type: String,
        nullable: true,
    })
    notes!: string | null;

    @ApiProperty({ example: '2026-07-04T10:00:00.000Z' })
    createdAt!: string;

    @ApiProperty({ example: '2026-07-04T10:00:00.000Z' })
    updatedAt!: string;
}

export class FaqItemDto {
    @ApiProperty({ example: 'Does RaktoSetu certify blood safety?' })
    question!: string;

    @ApiProperty({
        example:
            'No. RaktoSetu only connects people. Hospital screening remains required.',
    })
    answer!: string;
}

export class EligibilityInfoDto {
    @ApiProperty({ example: 18 })
    minimumAge!: number;

    @ApiProperty({ example: 90 })
    generalCooldownDays!: number;

    @ApiProperty({
        example:
            'Final donation eligibility is determined by medical staff at the hospital.',
    })
    note!: string;
}

export class AnnouncementViewDto {
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
    createdAt!: string;

    @ApiProperty({ example: '2026-07-04T10:00:00.000Z' })
    updatedAt!: string;
}
