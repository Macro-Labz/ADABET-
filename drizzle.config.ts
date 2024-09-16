import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default {
  schema: '@/db/schema/*',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
  },
} satisfies Config;