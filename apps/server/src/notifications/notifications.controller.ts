import { Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiRoute } from '../common/decorators/api-route.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }


    // ---------------- List Notifications ----------------

    @Get()
    @ApiRoute({ summary: 'List own notifications' })
    list(@CurrentUser() user: AuthUser) {
        return this.notificationsService.list(user);
    }


    // ---------------- Mark Read ----------------

    @Patch(':id/read')
    @ApiRoute({ summary: 'Mark notification as read', notFound: true })
    markRead(@CurrentUser() user: AuthUser, @Param('id') id: string) {
        return this.notificationsService.markRead(user, id);
    }


    // ---------------- Mark All Read ----------------

    @Patch('read-all')
    @ApiRoute({ summary: 'Mark all notifications as read' })
    markAllRead(@CurrentUser() user: AuthUser) {
        return this.notificationsService.markAllRead(user);
    }


    // ---------------- Unread Count ----------------

    @Get('unread-count')
    @ApiRoute({ summary: 'Get unread notification count' })
    unreadCount(@CurrentUser() user: AuthUser) {
        return this.notificationsService.unreadCount(user);
    }
}
