import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiRoute } from '@/common/decorators/api-route.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthUser } from '@/common/types/auth-user';
import { GetProfileResponse } from './users.dto';
import { UpdateProfileRequest, UpdateProfileResponse } from './users.dto';
import { UploadAvatarResponse } from './users.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }


    // ---------------- Get Profile ----------------

    @Get('profile')
    @ApiRoute({
        summary: 'Get own profile details',
        responseType: GetProfileResponse,
    })
    getProfile(@CurrentUser() user: AuthUser): Promise<GetProfileResponse> {
        return this.usersService.getProfile(user);
    }


    // ---------------- Update Profile ----------------

    @Put('profile')
    @ApiRoute({ summary: 'Update own profile', responseType: UpdateProfileResponse })
    updateProfile(
        @CurrentUser() user: AuthUser,
        @Body() dto: UpdateProfileRequest,
    ): Promise<UpdateProfileResponse> {
        return this.usersService.updateProfile(user, dto);
    }


    // ---------------- Upload Avatar ----------------

    @Post('profile/avatar')
    @ApiRoute({
        summary: 'Upload or replace profile photo',
        responseType: UploadAvatarResponse,
    })
    uploadAvatar(): UploadAvatarResponse {
        return {
            uploaded: false,
            message:
                'Avatar upload storage is not configured for the MVP backend.',
        };
    }
}
