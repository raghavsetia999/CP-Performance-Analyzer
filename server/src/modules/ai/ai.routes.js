import { Router } from 'express'
import { authMiddleware } from '../../middleware/authMiddleware.js'
import { validateRequest } from '../../middleware/validateRequest.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { chat, practicePlan, upsolvingPlan } from './ai.controller.js'
import { chatSchema, practicePlanSchema, upsolvingPlanSchema } from './ai.validation.js'

export const aiRouter = Router()

aiRouter.use(authMiddleware)
aiRouter.post('/practice-plan', validateRequest(practicePlanSchema), asyncHandler(practicePlan))
aiRouter.post('/upsolving-plan', validateRequest(upsolvingPlanSchema), asyncHandler(upsolvingPlan))
aiRouter.post('/chat', validateRequest(chatSchema), asyncHandler(chat))
