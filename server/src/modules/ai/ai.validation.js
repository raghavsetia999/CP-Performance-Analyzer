import { z } from 'zod'

const handle = z
  .string()
  .trim()
  .min(1)
  .max(32)
  .regex(/^[\w-]+$/, 'Invalid Codeforces handle format')

export const practicePlanSchema = {
  body: z.object({
    handle,
    preferredPracticeMinutes: z.coerce
      .number()
      .int()
      .refine((value) => [30, 60, 90, 120].includes(value))
      .optional(),
  }),
}

export const upsolvingPlanSchema = { body: z.object({ handle }) }

export const chatSchema = {
  body: z.object({
    handle,
    message: z.string().trim().min(1).max(1000),
  }),
}
