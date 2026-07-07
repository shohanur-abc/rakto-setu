import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import {
    ChangePasswordDto,
    ForgotPasswordDto,
    LoginDto,
    LogoutDto,
    OtpRequestDto,
    OtpVerifyDto,
    RegisterDto,
    ResetPasswordDto,
} from './dto/auth.dto';
import { ApiRoute } from '../common/decorators/api-route.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import type { AuthUser } from '../common/types/auth-user';
import { AuthLoginViewDto, UserViewDto } from '../common/dto/api-response.dto';

const REFRESH_COOKIE = 'rakto-setu.refresh';

const refreshCookieOptions = () => ({
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge:
        Number(process.env.REFRESH_EXPIRES_DAYS ?? '30') * 24 * 60 * 60 * 1000,
});

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
        responseType: UserViewDto,
    })
    register(@Body() dto: RegisterDto) {
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
        responseType: AuthLoginViewDto,
    })
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { refreshToken, ...payload } = await this.authService.login(dto);
        res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());

        return payload;
    }


    // ---------------- Refresh Session ----------------

    @Public()
    @Post('refresh')
    @Throttle({ default: { limit: 30, ttl: 60_000 } })
    @ApiRoute({
        summary: 'Exchange a refresh cookie for a new access token',
        status: 201,
        auth: false,
        tooManyRequests: true,
        responseType: AuthLoginViewDto,
    })
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const cookies = req.cookies as Record<string, string> | undefined;
        const { refreshToken, ...payload } = await this.authService.refresh(
            cookies?.[REFRESH_COOKIE],
        );
        res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());

        return payload;
    }


    // ---------------- Logout User ----------------

    @Post('logout')
    @ApiRoute({ summary: 'Invalidate current session', status: 201 })
    async logout(
        @CurrentUser() user: AuthUser,
        @Body() dto: LogoutDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.authService.logout(user, dto);
        await this.authService.revokeRefreshTokens(user.id);
        res.clearCookie(REFRESH_COOKIE, { path: '/' });

        return result;
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
    })
    requestOtp(@Body() dto: OtpRequestDto) {
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
    })
    verifyOtp(@Body() dto: OtpVerifyDto) {
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
    })
    forgotPassword(@Body() dto: ForgotPasswordDto) {
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
    })
    resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }


    // ---------------- Change Password ----------------

    @Post('password/change')
    @Throttle({ default: { limit: 5, ttl: 60_000 } })
    @ApiRoute({ summary: 'Change password while logged in', status: 201 })
    changePassword(
        @CurrentUser() user: AuthUser,
        @Body() dto: ChangePasswordDto,
    ) {
        return this.authService.changePassword(user, dto);
    }


    // ---------------- Current User ----------------

    @Get('me')
    @ApiRoute({
        summary: 'Get current authenticated user',
        responseType: UserViewDto,
    })
    me(@CurrentUser() user: AuthUser) {
        return this.authService.me(user);
    }
}
