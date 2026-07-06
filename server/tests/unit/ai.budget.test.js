import { describe, expect, it } from 'vitest'
import { buildPracticeBudget, estimateUpsolvingTimebox } from '../../src/modules/ai/ai.budget.js'

describe('AI practice budget', () => {
  it.each([
    [30, 1],
    [60, 2],
    [90, 3],
    [120, 4],
  ])('turns %i daily minutes into %i target slots', (minutes, targets) => {
    const budget = buildPracticeBudget(minutes)

    expect(budget.targetProblemsPerDay).toBe(targets)
    expect(budget.weeklyTargetRange.maximum).toBe(targets * 7)
    expect(budget.weeklyTargetRange.minimum).toBe(budget.difficultProblemsPerDay * 7)
    expect(budget.minutesPerProblemTimebox * targets + budget.reviewMinutes).toBeLessThanOrEqual(
      minutes,
    )
  })

  it('gives painful upsolves a longer but bounded estimated timebox', () => {
    expect(estimateUpsolvingTimebox({ attempts: 1, priorityLevel: 'Low' })).toBe(23)
    expect(estimateUpsolvingTimebox({ attempts: 8, priorityLevel: 'High' })).toBe(40)
  })
})
