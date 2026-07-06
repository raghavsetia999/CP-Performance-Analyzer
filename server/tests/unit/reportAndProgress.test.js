import { describe, expect, it, vi } from 'vitest'
import {
  buildReportPayload,
  ensureWeeklyReportForUser,
  saveReportForUser,
} from '../../src/modules/report/report.service.js'
import { buildProgressHistory } from '../../src/modules/progress/progress.service.js'
import { buildRecommendations } from '../../src/modules/recommendation/recommendation.engine.js'
import { PassThrough } from 'node:stream'
import { createReportPdf } from '../../src/modules/report/report.pdf.js'

function analysisFixture() {
  const recommendations = buildRecommendations({
    topicAnalysis: [{ topic: 'DP', weakness: 70, attempted: 5, solved: 2, rate: 40 }],
    ratingAnalysis: [{ bucket: '1200–1400', attempted: 5, rate: 40, weakness: 70, weakTags: [] }],
    verdictAnalysis: {
      mostCommonFailedVerdict: { name: 'Wrong Answer' },
      wrongAnswerHeavyTags: [],
      timeLimitHeavyTags: [],
    },
    upsolvingAnalysis: [],
  })
  return {
    profile: { handle: 'fixture', rating: 1200 },
    summary: { solvedProblems: 10 },
    topicAnalysis: [{ topic: 'DP', weakness: 70, attempted: 5 }],
    ratingAnalysis: [],
    verdictAnalysis: { distribution: [] },
    upsolvingAnalysis: [],
    recommendations,
    metadata: { submissionCount: 20 },
    generatedAt: '2026-06-01T00:00:00.000Z',
  }
}

describe('report persistence helpers', () => {
  it('builds the complete persisted report contract', () => {
    const analysis = analysisFixture()
    const payload = buildReportPayload('user-1', analysis, { plan: [] })
    expect(payload).toMatchObject({
      userId: 'user-1',
      handle: 'fixture',
      isSaved: true,
      metadata: { aiEnabled: false, coachSource: 'rule_based' },
    })
  })

  it('supports an injected model and analyzer for isolated persistence tests', async () => {
    const saved = await saveReportForUser(
      { id: 'user-1', preferredPracticeMinutes: 60 },
      'fixture',
      {
        analyze: async () => analysisFixture(),
        model: { create: async (value) => ({ ...value, id: 'report-1' }) },
      },
    )
    expect(saved.id).toBe('report-1')
    expect(saved.practicePlan.plan).toHaveLength(7)
  })

  it('renders a valid PDF report stream', async () => {
    const output = new PassThrough()
    const chunks = []
    output.on('data', (chunk) => chunks.push(chunk))
    const finished = new Promise((resolve, reject) => {
      output.on('finish', resolve)
      output.on('error', reject)
    })
    createReportPdf(buildReportPayload('user-1', analysisFixture(), { plan: [] }), output)
    await finished
    const pdf = Buffer.concat(chunks)

    expect(pdf.subarray(0, 4).toString()).toBe('%PDF')
    expect(pdf.length).toBeGreaterThan(1000)
  })

  it('generates a weekly report after seven days and records comparison data', async () => {
    const previous = {
      generatedAt: '2026-06-01T00:00:00.000Z',
      profile: { rating: 1180 },
      summary: { solvedProblems: 8 },
      topicAnalysis: [{ topic: 'DP', weakness: 80, attempted: 5 }],
    }
    const create = vi.fn(async (payload) => ({ ...payload, id: 'weekly-2' }))
    const result = await ensureWeeklyReportForUser(
      {
        id: 'user-1',
        codeforcesHandle: 'fixture',
        preferredPracticeMinutes: 60,
        preferences: { weeklyReport: true },
      },
      {
        analyze: async () => analysisFixture(),
        model: {
          findOne: () => ({ sort: () => ({ lean: async () => previous }) }),
          create,
        },
      },
      new Date('2026-06-10T00:00:00.000Z'),
    )

    expect(result.generated).toBe(true)
    expect(result.report.reportType).toBe('weekly')
    expect(result.report.weeklyComparison).toMatchObject({
      hasBaseline: true,
      solvedChange: 2,
      ratingChange: 20,
      weaknessChange: -10,
    })
    expect(create).toHaveBeenCalledOnce()
  })

  it('reuses the current weekly report before the next seven-day boundary', async () => {
    const current = { id: 'weekly-1', generatedAt: '2026-06-08T00:00:00.000Z' }
    const analyze = vi.fn()
    const result = await ensureWeeklyReportForUser(
      {
        id: 'user-1',
        codeforcesHandle: 'fixture',
        preferredPracticeMinutes: 60,
        preferences: { weeklyReport: true },
      },
      {
        analyze,
        model: {
          findOne: () => ({ sort: () => ({ lean: async () => current }) }),
        },
      },
      new Date('2026-06-10T00:00:00.000Z'),
    )

    expect(result).toMatchObject({ report: current, generated: false })
    expect(analyze).not.toHaveBeenCalled()
  })
})

describe('progress history', () => {
  it('requires two reports before claiming trend confidence', () => {
    const one = buildProgressHistory([
      {
        id: 'one',
        generatedAt: '2026-06-01T00:00:00.000Z',
        profile: { rating: 1200 },
        summary: { solvedProblems: 10 },
        topicAnalysis: [{ topic: 'DP', weakness: 70, attempted: 5 }],
      },
    ])
    expect(one.hasEnoughData).toBe(false)

    const two = buildProgressHistory([
      ...one.points.map((point) => ({
        id: point.reportId,
        generatedAt: point.generatedAt,
        profile: { rating: point.rating },
        summary: { solvedProblems: point.solved },
        topicAnalysis: [{ topic: 'DP', weakness: 70, attempted: 5 }],
      })),
      {
        id: 'two',
        generatedAt: '2026-06-08T00:00:00.000Z',
        profile: { rating: 1240 },
        summary: { solvedProblems: 14 },
        topicAnalysis: [{ topic: 'DP', weakness: 55, attempted: 8 }],
      },
    ])
    expect(two.hasEnoughData).toBe(true)
    expect(two.topicImprovement[0].improvement).toBe(15)
  })
})
