import { ApiProperty } from '@nestjs/swagger';

export class HealthResponse {
    @ApiProperty({ example: 'RaktoSetu API' })
    name!: string;

    @ApiProperty({ example: 'ok' })
    status!: string;
}
