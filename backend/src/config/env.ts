import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  SESSION_SECRET: z.string().min(16),
  ENCRYPTION_KEY: z.string().length(64),
  DATABASE_URL: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
  GOOGLE_REDIRECT_URI: z
    .string()
    .default('http://localhost:3001/auth/google/callback'),
  GOOGLE_CONNECT_REDIRECT_URI: z
    .string()
    .default('http://localhost:3001/connections/google/callback'),
  SLACK_CLIENT_ID: z.string().optional().default(''),
  SLACK_CLIENT_SECRET: z.string().optional().default(''),
  SLACK_REDIRECT_URI: z
    .string()
    .default('http://localhost:3001/connections/slack/callback'),
  ASANA_CLIENT_ID: z.string().optional().default(''),
  ASANA_CLIENT_SECRET: z.string().optional().default(''),
  ASANA_REDIRECT_URI: z
    .string()
    .default('http://localhost:3001/connections/asana/callback'),
  OPENROUTER_API_KEY: z.string().optional().default(''),
  OPENROUTER_MODEL: z.string().default('anthropic/claude-sonnet-4.5'),
  OPENROUTER_TEMPERATURE: z.coerce.number().default(0.3),
  OPENROUTER_MAX_TOKENS: z.coerce.number().default(2000),
  RESEND_API_KEY: z.string().optional().default(''),
  EMAIL_FROM: z.string().default('AI COO <onboarding@resend.dev>'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
