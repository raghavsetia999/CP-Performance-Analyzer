import 'dotenv/config'
import { z } from 'zod'

const developmentSecret = 'development-only-secret-change-before-production'

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(5000),
    MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/cp-performance-analyzer'),
    CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
    JWT_SECRET: z.string().min(32).default(developmentSecret),
    JWT_EXPIRES_IN: z.string().default('7d'),
    BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(10),
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
    OPENAI_API_KEY: z.string().optional(),
    AI_MODEL: z.string().optional(),
  })
  .superRefine((values, context) => {
    if (values.NODE_ENV === 'production' && values.JWT_SECRET === developmentSecret) {
      context.addIssue({
        code: 'custom',
        path: ['JWT_SECRET'],
        message: 'JWT_SECRET must be configured in production',
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
