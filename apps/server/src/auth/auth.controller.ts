import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { ChangePasswordRequest, ChangePasswordResponse } from './auth.dto';
import { CheckAvailabilityRequest, CheckAvailabilityResponse } from './auth.dto';
import { ForgotPasswordRequest, ForgotPasswordResponse } from './auth.dto';
import { LoginRequest, LoginResponse } from './auth.dto';
import { LogoutRequest, LogoutResponse } from './auth.dto';
import { MeResponse } from './auth.dto';
import { RegisterRequest, RegisterResponse } from './auth.dto';
import { RequestOtpRequest, RequestOtpResponse } from './auth.dto';
import { ResetPasswordRequest, ResetPasswordResponse } from './auth.dto';
import { VerifyOtpRequest, VerifyOtpResponse } from './auth.dto';
import { ApiRoute } from '@/common/decorators/api-route.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import type { AuthUser } from '@/common/types/auth-user';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }


    // ---------------- Register User ----------------

    @Public()
    @Post('register')
    @ApiRoute({
        summary: 'Register a recipient account',
        status: 201,
        auth: false,
        conflict: true,
        tooManyRequests: true,
        responseType: RegisterResponse,
    })
    register(@Body() dto: RegisterRequest): Promise<RegisterResponse> {
        return this.authService.register(dto);
    }


    // ---------------- Login User ----------------

    @Public()
    @Post('login')
    @Throttle({ default: { limit: 5, ttl: 60_000 } })
    @ApiRoute({
        summary: 'Authenticate and receive a JWT',
        status: 201,
        auth: false,
        tooManyRequests: true,
        responseType: LoginResponse,
    })
    login(@Body() dto: LoginRequest): Promise<LoginResponse> {
        return this.authService.login(dto);
    }

    @Public()
    @Post('check-availability')
    @ApiRoute({
        summary: 'Check if a phone number or email is available',
        status: 201,
        auth: false,
        responseType: CheckAvailabilityResponse,
    })
    checkAvailability(
        @Body() dto: CheckAvailabilityRequest,
    ): Promise<CheckAvailabilityResponse> {
        return this.authService.checkAvailability(dto);
    }


    // ---------------- Logout User ----------------

    @Post('logout')
    @ApiRoute({
        summary: 'Invalidate current session',
        status: 201,
        responseType: LogoutResponse,
    })
    logout(
        @CurrentUser() user: AuthUser,
        @Body() dto: LogoutRequest,
    ): Promise<LogoutResponse> {
        return this.authService.logout(user, dto);
    }


    // ---------------- Request Otp ----------------

    @Public()
    @Post('otp/request')
    @Throttle({ default: { limit: 3, ttl: 60_000 } })
    @ApiRoute({
        summary: 'Request an OTP code',
        status: 201,
        auth: false,
        tooManyRequests: true,
        responseType: RequestOtpResponse,
    })
    requestOtp(@Body() dto: RequestOtpRequest): Promise<RequestOtpResponse> {
        return this.authService.requestOtp(dto);
    }


    // ---------------- Verify Otp ----------------

    @Public()
    @Post('otp/verify')
    @Throttle({ default: { limit: 5, ttl: 60_000 } })
    @ApiRoute({
        summary: 'Verify OTP and activate account',
        status: 201,
        auth: false,
        tooManyRequests: true,
        responseType: VerifyOtpResponse,
    })
    verifyOtp(@Body() dto: VerifyOtpRequest): Promise<VerifyOtpResponse> {
        return this.authService.verifyOtp(dto);
    }


    // ---------------- Forgot Password ----------------

    @Public()
    @Post('password/forgot')
    @Throttle({ default: { limit: 3, ttl: 60_000 } })
    @ApiRoute({
        summary: 'Start password reset',
        status: 201,
        auth: false,
        tooManyRequests: true,
        responseType: ForgotPasswordResponse,
    })
    forgotPassword(
        @Body() dto: ForgotPasswordRequest,
    ): Promise<ForgotPasswordResponse> {
        return this.authService.forgotPassword(dto);
    }


    // ---------------- Reset Password ----------------

    @Public()
    @Post('password/reset')
    @Throttle({ default: { limit: 5, ttl: 60_000 } })
    @ApiRoute({
        summary: 'Complete password reset',
        status: 201,
        auth: false,
        tooManyRequests: true,
        responseType: ResetPasswordResponse,
    })
    resetPassword(
        @Body() dto: ResetPasswordRequest,
    ): Promise<ResetPasswordResponse> {
        return this.authService.resetPassword(dto);
    }


    // ---------------- Change Password ----------------

    @Post('password/change')
    @Throttle({ default: { limit: 5, ttl: 60_000 } })
    @ApiRoute({
        summary: 'Change password while logged in',
        status: 201,
        responseType: ChangePasswordResponse,
    })
    changePassword(
        @CurrentUser() user: AuthUser,
        @Body() dto: ChangePasswordRequest,
    ): Promise<ChangePasswordResponse> {
        return this.authService.changePassword(user, dto);
    }


    // ---------------- Current User ----------------

    @Get('me')
    @ApiRoute({
        summary: 'Get current authenticated user',
        responseType: MeResponse,
    })
    me(@CurrentUser() user: AuthUser): Promise<MeResponse> {
        return this.authService.me(user);
    }
}
