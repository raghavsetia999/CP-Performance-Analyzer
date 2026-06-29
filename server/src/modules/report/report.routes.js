import { Router } from 'express'
import { authMiddleware } from '../../middleware/authMiddleware.js'
import { validateRequest } from '../../middleware/validateRequest.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import {
  deleteReport,
  getLatestReport,
  getReport,
  listReports,
  saveReport,
} from './report.controller.js'
import { latestReportSchema, reportIdSchema, saveReportSchema } from './report.validation.js'

export const reportRouter = Router()

reportRouter.use(authMiddleware)
reportRouter.post('/save', validateRequest(saveReportSchema), asyncHandler(saveReport))
reportRouter.get('/', asyncHandler(listReports))
reportRouter.get(
  '/handle/:handle/latest',
  validateRequest(latestReportSchema),
  asyncHandler(getLatestReport),
)
reportRouter.get('/:id', validateRequest(reportIdSchema), asyncHandler(getReport))
reportRouter.delete('/:id', validateRequest(reportIdSchema), asyncHandler(deleteReport))
