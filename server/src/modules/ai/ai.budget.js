const supportedPracticeMinutes = new Set([30, 60, 90, 120])

export function buildPracticeBudget(preferredPracticeMinutes = 60) {
  const dailyMinutes = supportedPracticeMinutes.has(Number(preferredPracticeMinutes))
    ? Number(preferredPracticeMinutes)
    : 60
  const targetProblemsPerDay = Math.max(1, Math.floor(dailyMinutes / 30))
  const difficultProblemsPerDay = Math.max(1, Math.ceil(targetProblemsPerDay / 2))
  const reviewMinutes = Math.max(5, Math.round(dailyMinutes * 0.2))
  const workingMinutes = dailyMinutes - reviewMinutes

  return {
    dailyMinutes,
    targetProblemsPerDay,
    difficultProblemsPerDay,
    weeklyTargetRange: {
      minimum: difficultProblemsPerDay * 7,
      maximum: targetProblemsPerDay * 7,
    },
    minutesPerProblemTimebox: Math.floor(workingMinutes / targetProblemsPerDay),
    reviewMinutes,
    guidance:
      'Targets are timed attempts, not guaranteed solves. A difficult upsolve may use two standard time slots.',
  }
}

export function estimateUpsolvingTimebox(problem) {
  const attempts = Number(problem.attempts) || 0
  const priorityBonus = problem.priorityLevel === 'High' ? 5 : 0
  return Math.min(45, 20 + Math.min(15, attempts * 3) + priorityBonus)
}
