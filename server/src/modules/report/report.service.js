import { generatePracticePlanFromReport } from '../ai/ai.engine.js'
import { analyzeHandle } from '../analytics/analytics.service.js'
import { ApiError } from '../../utils/ApiError.js'
import { Report } from './report.model.js'

export function buildReportPayload(userId, analysis, practicePlan) {
  return {
    userId,
    handle: analysis.profile.handle,
    profile: analysis.profile,
    summary: analysis.summary,
    topicAnalysis: analysis.topicAnalysis,
    ratingAnalysis: analysis.ratingAnalysis,
    verdictAnalysis: analysis.verdictAnalysis,
    upsolvingProblems: analysis.upsolvingAnalysis,
    recommendations: analysis.recommendations,
    practicePlan,
    generatedAt: analysis.generatedAt || new Date(),
    metadata: {
      source: 'codeforces',
      analyticsVersion: 1,
      coachSource: 'rule_based',
      aiEnabled: false,
      ...analysis.metadata,
    },
    source: analysis.metadata,
    isSaved: true,
  }
}

export async function saveReportForUser(
  user,
  handle,
  dependencies = { analyze: analyzeHandle, model: Report },
) {
  const analysis = await dependencies.analyze(handle)
  const practicePlan = generatePracticePlanFromReport(analysis, {
    preferredPracticeMinutes: user.preferredPracticeMinutes,
  })
  const report = await dependencies.model.create(
    buildReportPayload(user.id, analysis, practicePlan),
  )
  return report.toJSON ? report.toJSON() : report
}

export async function listReportsForUser(userId) {
  return Report.find({ userId })
    .sort({ generatedAt: -1 })
    .select('handle profile summary generatedAt metadata createdAt')
    .lean()
}

export async function getReportForUser(userId, reportId) {
  const report = await Report.findOne({ _id: reportId, userId }).lean()
  if (!report) throw new ApiError(404, 'REPORT_NOT_FOUND', 'The requested report was not found.')
  return report
}

export async function getLatestReportForHandle(userId, handle) {
  const report = await Report.findOne({ userId, handle }).sort({ generatedAt: -1 }).lean()
  if (!report) {
    throw new ApiError(404, 'REPORT_NOT_FOUND', 'No saved report exists for this handle yet.')
  }
  return report
}

export async function deleteReportForUser(userId, reportId) {
  const report = await Report.findOneAndDelete({ _id: reportId, userId })
  if (!report) throw new ApiError(404, 'REPORT_NOT_FOUND', 'The requested report was not found.')
  return { deleted: true, id: reportId }
}
