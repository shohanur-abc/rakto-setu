import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';



// ---------------- Shared ----------------

export class NotificationResponse {
    @ApiProperty({ example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a' })
    id!: string;

    @ApiProperty({ example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a' })
    userId!: string;

    @ApiProperty({ example: 'status_update' })
    type!: string;

    @ApiProperty({ example: 'Blood request published' })
    title!: string;

    @ApiProperty({ example: 'Your blood request is now visible to matching donors.' })
    body!: string;

    @ApiPropertyOptional({ example: 'f45f84c9-2685-4c17-bf6d-86de9879a33a', nullable: true })
    referenceId!: string | null;

    @ApiProperty({ example: 'in_app' })
    channel!: string;

    @ApiProperty({ example: false })
    isRead!: boolean;

    @ApiProperty({ example: '2026-07-04T10:00:00.000Z' })
    createdAt!: string | Date;
}



// ---------------- List Notifications ----------------

export class ListNotificationsResponse extends NotificationResponse { }



// ---------------- Mark Read ----------------

export class MarkReadResponse extends NotificationResponse { }



// ---------------- Mark All Read ----------------

export class MarkAllReadResponse {
    @ApiProperty({ example: 3 })
    updated!: number;
}



// ---------------- Unread Count ----------------

export class UnreadCountResponse {
    @ApiProperty({ example: 3 })
    count!: number;
}
