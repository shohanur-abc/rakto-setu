import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const placeholderDatabaseUrl =
  'postgresql://user:password@localhost:5432/rakto_setu';
const isGenerateCommand = process.argv.includes('generate');
const directDatabaseUrl = process.env.DIRECT_URL;

if (!directDatabaseUrl && !isGenerateCommand) {
  throw new Error('DIRECT_URL is required for Prisma database commands.');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Migrations need the direct (non-pooled) Neon connection. The placeholder
    // keeps `prisma generate` working in Docker builds, where no DB is needed.
    url: directDatabaseUrl ?? placeholderDatabaseUrl,
  },
});
