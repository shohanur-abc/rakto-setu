import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsEmail,
    IsIn,
    IsOptional,
    IsPhoneNumber,
    IsString,
    IsUUID,
    Length,
    MinLength,
} from 'class-validator';
import { bloodGroupExamples } from '../../common/utils/blood-group';

export class RegisterDto {
    @ApiProperty({
        description: 'Full legal or commonly used name',
        example: 'Md Rahim Uddin',
    })
    @IsString()
    @Length(2, 120)
    fullName!: string;

    @ApiProperty({
        description: 'Primary phone number in international format',
        example: '+8801712345678',
    })
    @IsPhoneNumber()
    phone!: string;

    @ApiPropertyOptional({
        description: 'Optional email address',
        example: 'rahim@example.com',
    })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({
        description: 'Account password',
        example: 'StrongPass123!',
        minLength: 8,
    })
    @IsString()
    @MinLength(8)
    password!: string;

    @ApiPropertyOptional({
        description: 'Optional blood group for the account profile',
        example: 'O+',
        enum: bloodGroupExamples,
    })
    @IsOptional()
    @IsIn(bloodGroupExamples)
    bloodGroup?: string;

    @ApiPropertyOptional({
        description: 'Optional location id',
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

export class LoginDto {
    @ApiProperty({
        description: 'Primary account phone number',
        example: '+8801712345678',
    })
    @IsPhoneNumber()
    phone!: string;

    @ApiProperty({
        description: 'Account password',
        example: 'StrongPass123!',
    })
    @IsString()
    password!: string;
}

export class OtpRequestDto {
    @ApiProperty({
        description: 'Phone number that should receive an OTP',
        example: '+8801712345678',
    })
    @IsPhoneNumber()
    phone!: string;
}

export class OtpVerifyDto extends OtpRequestDto {
    @ApiProperty({
        description: 'Six digit OTP code',
        example: '123456',
    })
    @IsString()
    @Length(6, 6)
    code!: string;
}

export class ForgotPasswordDto extends OtpRequestDto {}

export class ResetPasswordDto extends OtpVerifyDto {
    @ApiProperty({
        description: 'New account password',
        example: 'NewStrongPass123!',
        minLength: 8,
    })
    @IsString()
    @MinLength(8)
    newPassword!: string;
}

export class ChangePasswordDto {
    @ApiProperty({
        description: 'Current password',
        example: 'StrongPass123!',
    })
    @IsString()
    currentPassword!: string;

    @ApiProperty({
        description: 'New password',
        example: 'NewStrongPass123!',
        minLength: 8,
    })
    @IsString()
    @MinLength(8)
    newPassword!: string;
}

export class LogoutDto {
    @ApiPropertyOptional({
        description:
            'Optional flag for clients that want to clear all sessions later',
        example: false,
    })
    @IsOptional()
    @IsBoolean()
    allSessions?: boolean;
}
