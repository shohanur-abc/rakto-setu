import { UserResponse } from '@/common/dto/api-response.dto';
import { bloodGroupExamples } from '@/common/utils/blood-group';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsIn, IsOptional, IsPhoneNumber, IsString, IsUUID, Length, Matches, MinLength } from 'class-validator';



// ---------------- Shared ----------------

export class PhoneOtpRequest {
    @ApiProperty({
        description: 'Phone number that should receive an OTP',
        example: '+8801712345678',
    })
    @IsPhoneNumber()
    phone!: string;
}

export class PhoneOtpCodeRequest extends PhoneOtpRequest {
    @ApiProperty({
        description: 'Six digit OTP code',
        example: '123456',
    })
    @IsString()
    @Length(6, 6)
    code!: string;
}

export class CodeSentResponse {
    @ApiProperty({ example: true })
    sent!: boolean;

    @ApiProperty({ example: '123456' })
    devCode!: string;
}



// ---------------- Register User ----------------

export class RegisterRequest {
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

export class RegisterResponse extends UserResponse { }



// ---------------- Login User ----------------

export class LoginRequest {
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

export class LoginResponse {
    @ApiProperty({ type: () => UserResponse })
    user!: UserResponse;

    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
    token!: string;
}



// ---------------- Check Availability ----------------

const toOptionalTrimmedString = ({ value }: { value: unknown }) => {
    if (typeof value !== 'string') {
        return undefined;
    }

    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : undefined;
};

export class CheckAvailabilityRequest {
    @ApiPropertyOptional({
        example: '+8801733336235',
        description: 'Bangladeshi phone number with country code',
    })
    @Transform(toOptionalTrimmedString)
    @IsOptional()
    @Matches(/^\+8801[3-9]\d{8}$/, {
        message: 'phone must be a valid Bangladeshi phone number',
    })
    phone?: string;

    @ApiPropertyOptional({
        example: 'donor@example.com',
        description: 'User email address',
    })
    @Transform(({ value }: { value: unknown }) => {
        if (typeof value !== 'string') {
            return undefined;
        }

        const trimmed = value.trim().toLowerCase();

        return trimmed.length > 0 ? trimmed : undefined;
    })
    @IsOptional()
    @IsEmail({}, { message: 'email must be a valid email address' })
    email?: string;
}

export class AvailabilityErrorResponse {
    @ApiProperty({ example: 'phone' })
    field!: string;

    @ApiProperty({ example: 'This phone number is already registered' })
    message!: string;
}

export class CheckAvailabilityResponse {
    @ApiProperty({ example: false })
    available!: boolean;

    @ApiProperty({ type: () => [AvailabilityErrorResponse] })
    errors!: AvailabilityErrorResponse[];
}



// ---------------- Logout User ----------------

export class LogoutRequest {
    @ApiPropertyOptional({
        description:
            'Optional flag for clients that want to clear all sessions later',
        example: false,
    })
    @IsOptional()
    @IsBoolean()
    allSessions?: boolean;
}

export class LogoutResponse {
    @ApiProperty({ example: true })
    loggedOut!: boolean;
}



// ---------------- Request OTP ----------------

export class RequestOtpRequest extends PhoneOtpRequest { }

export class RequestOtpResponse extends CodeSentResponse { }



// ---------------- Verify OTP ----------------

export class VerifyOtpRequest extends PhoneOtpCodeRequest { }

export class VerifyOtpResponse {
    @ApiProperty({ example: true })
    verified!: boolean;
}



// ---------------- Forgot Password ----------------

export class ForgotPasswordRequest extends PhoneOtpRequest { }

export class ForgotPasswordResponse extends CodeSentResponse { }



// ---------------- Reset Password ----------------

export class ResetPasswordRequest extends PhoneOtpCodeRequest {
    @ApiProperty({
        description: 'New account password',
        example: 'NewStrongPass123!',
        minLength: 8,
    })
    @IsString()
    @MinLength(8)
    newPassword!: string;
}

export class ResetPasswordResponse {
    @ApiProperty({ example: true })
    reset!: boolean;
}



// ---------------- Change Password ----------------

export class ChangePasswordRequest {
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

export class ChangePasswordResponse {
    @ApiProperty({ example: true })
    changed!: boolean;
}



// ---------------- Current User ----------------

export class MeResponse extends UserResponse { }
