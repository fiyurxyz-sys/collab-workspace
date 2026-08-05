import { z } from 'zod';

const envSchema = z.object({
  // Supports DATABASE_URL or POSTGRES_PRISMA_URL
  DATABASE_URL: z.string().min(1).optional(),
  POSTGRES_PRISMA_URL: z.string().min(1).optional(),
  DIRECT_URL: z.string().optional(),
  POSTGRES_URL_NON_POOLING: z.string().optional(),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // App
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(12),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
}).refine(
  (data) => data.DATABASE_URL || data.POSTGRES_PRISMA_URL,
  { message: "Either DATABASE_URL or POSTGRES_PRISMA_URL must be provided" }
);

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  throw new Error('Invalid environment variables');
}

// Normalize DATABASE_URL and DIRECT_URL
const dbUrl = parsed.data.DATABASE_URL || parsed.data.POSTGRES_PRISMA_URL!;
const directUrl = parsed.data.DIRECT_URL || parsed.data.POSTGRES_URL_NON_POOLING || dbUrl;

process.env.DATABASE_URL = dbUrl;
process.env.DIRECT_URL = directUrl;

export const env = {
  ...parsed.data,
  DATABASE_URL: dbUrl,
  DIRECT_URL: directUrl,
};
