import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {

    // ---------------- Health Check ----------------

    health() {
        return {
            name: 'RaktoSetu API',
            status: 'ok',
        };
    }
}
