import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { env } from '../../config/env.js'
import { authMiddleware } from '../../middleware/authMiddleware.js'
import { validateRequest } from '../../middleware/validateRequest.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { chat, practicePlan, upsolvingPlan } from './ai.controller.js'
import { chatSchema, practicePlanSchema, upsolvingPlanSchema } from './ai.validation.js'

export const aiRouter = Router()

aiRouter.use(authMiddleware)
aiRouter.use(
  rateLimit({
    windowMs: env.AI_RATE_LIMIT_WINDOW_MS,
    limit: env.NODE_ENV === 'test' ? 1000 : env.AI_RATE_LIMIT_MAX,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    keyGenerator: (request) => String(request.user._id),
    message: {
      success: false,
      error: {
        code: 'AI_RATE_LIMIT_EXCEEDED',
        message: 'Too many coach requests. Please wait before trying again.',
        details: null,
      },
    },
  }),
)
aiRouter.post('/practice-plan', validateRequest(practicePlanSchema), asyncHandler(practicePlan))
aiRouter.post('/upsolving-plan', validateRequest(upsolvingPlanSchema), asyncHandler(upsolvingPlan))
aiRouter.post('/chat', validateRequest(chatSchema), asyncHandler(chat))
