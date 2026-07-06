import { generatePracticePlanFromReport } from '../ai/ai.engine.js'
import { analyzeHandle } from '../analytics/analytics.service.js'
import { ApiError } from '../../utils/ApiError.js'
import { Report } from './report.model.js'

function overallWeakness(topics = []) {
  const attempted = topics.reduce((total, topic) => total + (topic.attempted || 0), 0)
  if (!attempted) return 0
  return Math.round(
    topics.reduce((total, topic) => total + (topic.weakness || 0) * (topic.attempted || 0), 0) /
      attempted,
  )
}

export function buildWeeklyComparison(previousReport, analysis) {
  if (!previousReport) return { hasBaseline: false }
  return {
    hasBaseline: true,
    previousGeneratedAt: previousReport.generatedAt,
    solvedChange:
      (analysis.summary?.solvedProblems || 0) - (previousReport.summary?.solvedProblems || 0),
    ratingChange: (analysis.profile?.rating || 0) - (previousReport.profile?.rating || 0),
    weaknessChange:
      overallWeakness(analysis.topicAnalysis) - overallWeakness(previousReport.topicAnalysis),
  }
}

export function buildReportPayload(userId, analysis, practicePlan, options = {}) {
  return {
    userId,
    handle: analysis.profile.handle,
    reportType: options.reportType || 'manual',
    profile: analysis.profile,
    summary: analysis.summary,
    topicAnalysis: analysis.topicAnalysis,
    ratingAnalysis: analysis.ratingAnalysis,
    verdictAnalysis: analysis.verdictAnalysis,
    upsolvingProblems: analysis.upsolvingAnalysis,
    recommendations: analysis.recommendations,
    practicePlan,
    weeklyComparison: options.weeklyComparison || null,
    generatedAt: options.generatedAt || analysis.generatedAt || new Date(),
    metadata: {
      source: 'codeforces',
      analyticsVersion: 1,
      coachSource: 'rule_based',
      aiEnabled: false,
      reportType: options.reportType || 'manual',
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
  options = {},
) {
  const analysis = await dependencies.analyze(handle)
  const practicePlan = generatePracticePlanFromReport(analysis, {
    preferredPracticeMinutes: user.preferredPracticeMinutes,
  })
  const report = await dependencies.model.create(
    buildReportPayload(user.id, analysis, practicePlan, options),
  )
  return report.toJSON ? report.toJSON() : report
}

export async function ensureWeeklyReportForUser(
  user,
  dependencies = { analyze: analyzeHandle, model: Report },
  now = new Date(),
) {
  if (!user.preferences?.weeklyReport) {
    throw new ApiError(
      403,
      'WEEKLY_REPORTS_DISABLED',
      'Enable weekly reports in notification settings first.',
    )
  }
  if (!user.codeforcesHandle) {
    throw new ApiError(400, 'CODEFORCES_HANDLE_REQUIRED', 'Add a Codeforces handle first.')
  }

  const latest = await dependencies.model
    .findOne({ userId: user.id, handle: user.codeforcesHandle, reportType: 'weekly' })
    .sort({ generatedAt: -1 })
    .lean()
  const nextEligibleAt = latest
    ? new Date(new Date(latest.generatedAt).getTime() + 7 * 24 * 60 * 60 * 1000)
    : null

  if (latest && nextEligibleAt > now) {
    return { report: latest, generated: false, nextEligibleAt }
  }

  const analysis = await dependencies.analyze(user.codeforcesHandle)
  const practicePlan = generatePracticePlanFromReport(analysis, {
    preferredPracticeMinutes: user.preferredPracticeMinutes,
  })
  const weeklyComparison = buildWeeklyComparison(latest, analysis)
  const report = await dependencies.model.create(
    buildReportPayload(user.id, analysis, practicePlan, {
      reportType: 'weekly',
      weeklyComparison,
      generatedAt: now,
    }),
  )
  const serialized = report.toJSON ? report.toJSON() : report
  return {
    report: serialized,
    generated: true,
    nextEligibleAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
  }
}

export async function listReportsForUser(userId) {
  return Report.find({ userId })
    .sort({ generatedAt: -1 })
    .select('handle reportType profile summary generatedAt metadata createdAt')
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
