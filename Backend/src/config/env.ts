import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables from correct file
// Load environment variables from correct file
dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env', override: true });

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),

  JWT_ACCESS_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_ACCESS_EXPIRES_IN_MS: z.coerce.number().default(15 * 60 * 1000), // 15 mins
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN_MS: z.coerce.number().default(7 * 24 * 60 * 60 * 1000), // 7 days
  GOOGLE_CLIENT_ID: z.string().min(1, 'Google Client ID is required'),
  OTP_EXPIRES_IN_MS: z.coerce.number().default(15 * 60 * 1000), // 15 mins in ms
  BCRYPT_SALT_ROUNDS: z.string().transform(Number).default(12 as never),
  DEFAULT_USER_ROLE: z.string().default('CONSUMER'),

  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),

  SMTP_HOST: z.string().default('smtp.ethereal.email'),
  SMTP_PORT: z.string().transform(Number).default(587 as never),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('"AKMart" <noreply@akmart.com>'),

  FRONTEND_WEB_URL: z.string().url().default('http://localhost:5173'),
  FRONTEND_MOBILE_URL: z.string().default('com.akmart.app'),
  BACKEND_URL: z.string().url().default('http://localhost:5000'),

  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default(60000 as never),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default(1000 as never),
  AUTH_RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default(60000 as never),
  AUTH_RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default(5 as never),

  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET_NAME: z.string().optional(),
});

// Validate process.env against the schema
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1); // Fail fast
}

export const env = parsedEnv.data;
