import 'dotenv/config'
import { z } from 'zod'

const developmentSecret = 'development-only-secret-change-before-production'

const optionalString = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().optional(),
)

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(5000),
    MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/cp-performance-analyzer'),
    CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
    JWT_SECRET: z.string().min(32).default(developmentSecret),
    JWT_EXPIRES_IN: z.string().default('7d'),
    BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(10),
    PASSWORD_RESET_URL: z.string().url().default('http://localhost:5173/reset-password'),
    PASSWORD_RESET_EXPIRES_MINUTES: z.coerce.number().int().min(5).max(120).default(30),
    SMTP_HOST: optionalString,
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_SECURE: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
    SMTP_USER: optionalString,
    SMTP_PASS: optionalString,
    SMTP_FROM: z.string().default('CP Pulse <no-reply@cppulse.local>'),
    SENDGRID_API_KEY: optionalString,
    SENDGRID_FROM_EMAIL: z.string().email().default('no-reply@example.com'),
    SENDGRID_FROM_NAME: z.string().default('CP Pulse'),
    GOOGLE_CLIENT_ID: optionalString,
    GOOGLE_CLIENT_SECRET: optionalString,
    GOOGLE_CALLBACK_URL: z.string().url().default('http://localhost:5000/api/auth/google/callback'),
    CODEFORCES_API_BASE_URL: z.string().url().default('https://codeforces.com/api'),
    CODEFORCES_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
    CODEFORCES_CACHE_TTL_MS: z.coerce
      .number()
      .int()
      .positive()
      .default(5 * 60 * 1000),
    CODEFORCES_PROBLEMSET_CACHE_TTL_MS: z.coerce
      .number()
      .int()
      .positive()
      .default(6 * 60 * 60 * 1000),
    AI_PROVIDER: z.enum(['gemini', 'openai']).default('gemini'),
    GEMINI_API_KEY: z.string().optional(),
    GEMINI_API_BASE_URL: z.string().url().default('https://generativelanguage.googleapis.com'),
    OPENAI_API_KEY: z.string().optional(),
    AI_MODEL: z.string().optional(),
    AI_FALLBACK_MODEL: z.string().optional(),
    AI_TIMEOUT_MS: z.coerce.number().int().min(1000).max(30000).default(15000),
    AI_MAX_OUTPUT_TOKENS: z.coerce.number().int().min(256).max(4096).default(2048),
    AI_RATE_LIMIT_WINDOW_MS: z.coerce
      .number()
      .int()
      .min(60 * 1000)
      .default(15 * 60 * 1000),
    AI_RATE_LIMIT_MAX: z.coerce.number().int().min(1).max(100).default(20),
  })
  .superRefine((values, context) => {
    if (values.NODE_ENV === 'production' && values.JWT_SECRET === developmentSecret) {
      context.addIssue({
        code: 'custom',
        path: ['JWT_SECRET'],
        message: 'JWT_SECRET must be configured in production',
      })
    }
    if (Boolean(values.GOOGLE_CLIENT_ID) !== Boolean(values.GOOGLE_CLIENT_SECRET)) {
      context.addIssue({
        code: 'custom',
        path: ['GOOGLE_CLIENT_ID'],
        message: 'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured together',
      })
    }
    if (Boolean(values.SMTP_USER) !== Boolean(values.SMTP_PASS)) {
      context.addIssue({
        code: 'custom',
        path: ['SMTP_USER'],
        message: 'SMTP_USER and SMTP_PASS must be configured together',
      })
    }
  })

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ')
  throw new Error(`Invalid environment configuration: ${details}`)
}

export const env = Object.freeze(parsed.data)
