import { describe, expect, it } from 'vitest'
import {
  answerCoachQuestion,
  generatePracticePlanFromReport,
} from '../../src/modules/ai/ai.engine.js'
import { buildRecommendations } from '../../src/modules/recommendation/recommendation.engine.js'

const recommendationInput = {
  topicAnalysis: [
    { topic: 'Dynamic Programming', weakness: 82, attempted: 10, solved: 4, rate: 40 },
    { topic: 'probabilities', weakness: 100, attempted: 1, solved: 0, rate: 0 },
  ],
  ratingAnalysis: [{ bucket: '1200–1400', attempted: 8, rate: 50, weakness: 65, weakTags: [] }],
  verdictAnalysis: {
    mostCommonFailedVerdict: { name: 'Wrong Answer' },
    wrongAnswerHeavyTags: [{ tag: 'dp', count: 8 }],
    timeLimitHeavyTags: [{ tag: 'graphs', count: 3 }],
  },
  upsolvingAnalysis: [
    {
      problemKey: '100-A',
      contest: '100A',
      name: 'Example',
      rating: 1300,
      tags: ['dp'],
      priorityLevel: 'High',
      reason: 'matches a high-weakness topic',
      url: 'https://codeforces.com/problemset/problem/100/A',
    },
  ],
}

describe('recommendation engine', () => {
  it('adjusts focus for sample size and ranks upsolving problems', () => {
    const result = buildRecommendations(recommendationInput)
    expect(result.source).toBe('rule_based')
    expect(result.focusTopics[0].topic).toBe('Dynamic Programming')
    expect(result.recommendedRatingRange.bucket).toBe('1200–1400')
    expect(result.recommendedProblems[0].problemKey).toBe('100-A')
  })
})

describe('rule-based coach', () => {
  const report = {
    profile: { handle: 'fixture' },
    recommendations: buildRecommendations(recommendationInput),
    upsolvingAnalysis: recommendationInput.upsolvingAnalysis,
    verdictAnalysis: recommendationInput.verdictAnalysis,
  }

  it('creates a seven-day plan without external AI', () => {
    const result = generatePracticePlanFromReport(report, { preferredPracticeMinutes: 60 })
    expect(result.aiEnabled).toBe(false)
    expect(result.source).toBe('rule_based')
    expect(result.plan).toHaveLength(7)
  })

  it('answers chat prompts from deterministic report facts', () => {
    const result = answerCoachQuestion(report, 'What should I upsolve?')
    expect(result.aiEnabled).toBe(false)
    expect(result.answer).toContain('Example')
  })
})
