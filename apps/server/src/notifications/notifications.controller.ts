import { Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiRoute } from '@/common/decorators/api-route.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthUser } from '@/common/types/auth-user';
import { ListNotificationsResponse } from './notifications.dto';
import { MarkAllReadResponse } from './notifications.dto';
import { MarkReadResponse } from './notifications.dto';
import { UnreadCountResponse } from './notifications.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }


    // ---------------- List Notifications ----------------

    @Get()
    @ApiRoute({
        summary: 'List own notifications',
        responseType: ListNotificationsResponse,
        responseIsArray: true,
    })
    list(@CurrentUser() user: AuthUser): Promise<ListNotificationsResponse[]> {
        return this.notificationsService.list(user);
    }


    // ---------------- Mark Read ----------------

    @Patch(':id/read')
    @ApiRoute({
        summary: 'Mark notification as read',
        notFound: true,
        responseType: MarkReadResponse,
    })
    markRead(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
    ): Promise<MarkReadResponse> {
        return this.notificationsService.markRead(user, id);
    }


    // ---------------- Mark All Read ----------------

    @Patch('read-all')
    @ApiRoute({
        summary: 'Mark all notifications as read',
        responseType: MarkAllReadResponse,
    })
    markAllRead(@CurrentUser() user: AuthUser): Promise<MarkAllReadResponse> {
        return this.notificationsService.markAllRead(user);
    }


    // ---------------- Unread Count ----------------

    @Get('unread-count')
    @ApiRoute({
        summary: 'Get unread notification count',
        responseType: UnreadCountResponse,
    })
    unreadCount(@CurrentUser() user: AuthUser): Promise<UnreadCountResponse> {
        return this.notificationsService.unreadCount(user);
    }
}
