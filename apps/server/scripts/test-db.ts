import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    throw new Error('DATABASE_URL is not defined in the environment variables.');
}
const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter, log: ['query', 'error'] });

prisma.announcement.findMany()
    .then((data) => console.log('Query success:', data))
    .catch((e) => console.error('Query error:', e));