import { describe, expect, it } from 'vitest'
import {
  buildCoachQuestionContext,
  responseMatchesQuestion,
} from '../../src/modules/ai/ai.query.js'

const report = {
  profile: { handle: 'fixture', rating: 1450 },
  summary: { solvedProblems: 120, attemptedProblems: 160, acRate: 75 },
  topicAnalysis: [
    {
      topic: 'Geometry',
      short: 'Geometry',
      attempted: 5,
      solved: 3,
      unsolved: 2,
      rate: 60,
      weakness: 70,
      verdicts: { wrongAnswer: 4, timeLimit: 0 },
    },
    {
      topic: 'Dynamic Programming',
      short: 'DP',
      attempted: 15,
      solved: 11,
      unsolved: 4,
      rate: 73,
      weakness: 32,
      avgAttemptsBeforeAc: 2.1,
      verdicts: { wrongAnswer: 12, timeLimit: 1 },
    },
  ],
  ratingAnalysis: [
    {
      key: '1200-1400',
      bucket: '1200â€“1400',
      attempted: 10,
      solved: 8,
      failed: 5,
      rate: 80,
    },
    {
      key: '1400-1600',
      bucket: '1400â€“1600',
      attempted: 12,
      solved: 7,
      failed: 11,
      rate: 58,
    },
  ],
  verdictAnalysis: {
    mostCommonFailedVerdict: { name: 'Wrong Answer', value: 30 },
    firstTrySolvedProblems: 70,
    multiAttemptSolvedProblems: 50,
  },
  upsolvingAnalysis: [],
  recommendations: {
    focusTopics: [{ topic: 'Geometry', attempted: 5, solved: 3, rate: 60, weakness: 70 }],
    recommendedProblems: [
      {
        problemKey: '200-B',
        name: 'DP Practice',
        rating: 1500,
        tags: ['dp'],
        reason: 'Matches your requested topic and range.',
      },
      {
        problemKey: '300-C',
        name: 'Graph Practice',
        rating: 1500,
        tags: ['graphs'],
        reason: 'Graph practice.',
      },
    ],
  },
}

describe('AI question retrieval', () => {
  it('retrieves the topic named by the user instead of the top weakness', () => {
    const context = buildCoachQuestionContext(
      report,
      'Explain why I am weak in dynamic programming',
    )

    expect(context.intent).toBe('topic_analysis')
    expect(context.requestedTopic.topic).toBe('Dynamic Programming')
    expect(context.requestedTopic.assessment).toBe('not_a_strong_weakness')
    expect(context.evidence).toContainEqual({
      label: 'Dynamic Programming conversion',
      value: '11 of 15 solved (73%)',
    })
  })

  it('filters verified problem recommendations by topic and rating range', () => {
    const context = buildCoachQuestionContext(report, 'Suggest DP problems for the 1400-1600 range')

    expect(context.intent).toBe('problem_recommendation')
    expect(context.requestedRatingRange).toEqual({ min: 1400, max: 1600 })
    expect(context.relevantProblems.map((problem) => problem.problemKey)).toEqual(['200-B'])
  })

  it('rejects a model answer that substitutes an unrelated topic', () => {
    const context = buildCoachQuestionContext(report, 'Why am I weak in DP?')

    expect(
      responseMatchesQuestion(
        { answer: 'Geometry is your main weakness.', suggestedActions: [] },
        context,
      ),
    ).toBe(false)
    expect(
      responseMatchesQuestion(
        {
          answer:
            'Dynamic Programming is not a strong weakness: you solved 11 of 15 problems for a 73% conversion rate.',
          suggestedActions: ['Review DP transitions.'],
        },
        context,
      ),
    ).toBe(true)
  })
})
