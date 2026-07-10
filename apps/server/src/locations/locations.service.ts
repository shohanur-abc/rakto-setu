import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class LocationsService {
    constructor(private readonly prisma: PrismaService) { }


    // ---------------- List Locations ----------------

    async list() {
        return this.prisma.location.findMany({
            orderBy: [{ type: 'asc' }, { name: 'asc' }],
        });
    }
}
