import { Router } from 'express'
import { authMiddleware } from '../../middleware/authMiddleware.js'
import { validateRequest } from '../../middleware/validateRequest.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { handleParamsSchema } from '../codeforces/codeforces.validation.js'
import { recommendations } from './recommendation.controller.js'

export const recommendationRouter = Router()

recommendationRouter.use(authMiddleware)
recommendationRouter.get(
  '/:handle',
  validateRequest(handleParamsSchema),
  asyncHandler(recommendations),
)
