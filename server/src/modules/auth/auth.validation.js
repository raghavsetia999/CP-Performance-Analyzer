import { z } from 'zod'

const email = z
  .string()
  .trim()
  .email()
  .transform((value) => value.toLowerCase())
const password = z.string().min(8).max(72)
const handle = z
  .string()
  .trim()
  .max(32)
  .regex(
    /^[\w-]*$/,
    'Codeforces handle may only contain letters, numbers, underscores, and hyphens',
  )
  .optional()

export const registerSchema = {
  body: z.object({
    name: z.string().trim().min(2).max(80),
    email,
    password,
    codeforcesHandle: handle,
    targetRating: z.coerce.number().int().min(800).max(4000).optional(),
  }),
}

export const loginSchema = {
  body: z.object({ email, password: z.string().min(1) }),
}
