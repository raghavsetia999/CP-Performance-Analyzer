import { z } from 'zod'

const conciseText = (maximum) => z.string().trim().min(1).max(maximum)

const practiceDaySchema = z
  .object({
    day: z.enum(['01', '02', '03', '04', '05', '06', '07']),
    label: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
    topic: conciseText(80),
    goal: conciseText(300),
    count: z.number().int().min(1).max(8),
    range: conciseText(40),
    note: conciseText(300),
  })
  .strict()

export const practicePlanOutputSchema = z
  .object({
    overview: conciseText(600),
    plan: z.array(practiceDaySchema).length(7),
  })
  .strict()
  .superRefine((value, context) => {
    const expectedDays = ['01', '02', '03', '04', '05', '06', '07']
    const expectedLabels = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ]

    value.plan.forEach((item, index) => {
      if (item.day !== expectedDays[index] || item.label !== expectedLabels[index]) {
        context.addIssue({
          code: 'custom',
          path: ['plan', index],
          message: 'Practice-plan days must be ordered Monday through Sunday.',
        })
      }
    })
  })

export const upsolvingPlanOutputSchema = z
  .object({
    overview: conciseText(600),
    problemKeys: z.array(conciseText(80)).max(8),
    strategy: z.array(conciseText(300)).min(1).max(5),
  })
  .strict()

export const coachChatOutputSchema = z
  .object({
    answer: conciseText(3000),
    suggestedActions: z.array(conciseText(300)).max(3),
  })
  .strict()

export const practicePlanJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['overview', 'plan'],
  properties: {
    overview: { type: 'string' },
    plan: {
      type: 'array',
      minItems: 7,
      maxItems: 7,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['day', 'label', 'topic', 'goal', 'count', 'range', 'note'],
        properties: {
          day: {
            type: 'string',
            enum: ['01', '02', '03', '04', '05', '06', '07'],
          },
          label: {
            type: 'string',
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          },
          topic: { type: 'string' },
          goal: { type: 'string' },
          count: { type: 'integer', minimum: 1, maximum: 8 },
          range: { type: 'string' },
          note: { type: 'string' },
        },
      },
    },
  },
}

export const upsolvingPlanJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['overview', 'problemKeys', 'strategy'],
  properties: {
    overview: { type: 'string' },
    problemKeys: {
      type: 'array',
      maxItems: 8,
      items: { type: 'string' },
    },
    strategy: {
      type: 'array',
      minItems: 1,
      maxItems: 5,
      items: { type: 'string' },
    },
  },
}

export const coachChatJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['answer', 'suggestedActions'],
  properties: {
    answer: { type: 'string' },
    suggestedActions: {
      type: 'array',
      maxItems: 3,
      items: { type: 'string' },
    },
  },
}
