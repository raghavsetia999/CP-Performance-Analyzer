const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function problemCountFor(minutes) {
  if (minutes >= 120) return 5
  if (minutes >= 90) return 4
  if (minutes >= 60) return 3
  return 2
}

export function generatePracticePlanFromReport(report, options = {}) {
  const minutes = options.preferredPracticeMinutes || 60
  const count = problemCountFor(minutes)
  const topics = report.recommendations.focusTopics.map((item) => item.topic)
  const fallbackTopics = ['Implementation', 'Greedy', 'Mixed Practice']
  const focusTopics = topics.length ? topics : fallbackTopics
  const ratingRange = report.recommendations.recommendedRatingRange.bucket

  const plan = dayLabels.map((label, index) => {
    const topic = focusTopics[index % focusTopics.length]
    const isContestDay = index === 5
    const isReviewDay = index === 6
    return {
      day: String(index + 1).padStart(2, '0'),
      label,
      topic: isContestDay ? 'Mixed Contest' : isReviewDay ? 'Review and Upsolve' : topic,
      goal: isContestDay
        ? 'Complete a timed mixed set and record every blocked insight.'
        : isReviewDay
          ? 'Finish the highest-priority unsolved problems from the week.'
          : `Improve conversion and reduce repeated failures in ${topic}.`,
      count: isContestDay ? Math.max(4, count) : count,
      range: isReviewDay ? 'Mixed' : ratingRange,
      note: isContestDay
        ? 'Use contest conditions and avoid editorials during the timer.'
        : isReviewDay
          ? 'Write one sentence explaining every missed idea.'
          : 'Write the intended complexity and core invariant before coding.',
      done: false,
    }
  })

  return {
    source: 'rule_based',
    aiEnabled: false,
    handle: report.profile.handle,
    overview: `Focus on ${focusTopics.slice(0, 2).join(' and ')} while practicing mainly in the ${ratingRange} range.`,
    plan,
    generatedAt: new Date().toISOString(),
  }
}

export function generateUpsolvingPlanFromReport(report) {
  return {
    source: 'rule_based',
    aiEnabled: false,
    handle: report.profile.handle,
    problems: report.upsolvingAnalysis.slice(0, 8),
    strategy: report.recommendations.practiceStrategy,
    generatedAt: new Date().toISOString(),
  }
}

export function answerCoachQuestion(report, message) {
  const question = message.toLowerCase()
  const topTopic = report.recommendations.focusTopics[0]
  const ratingRange = report.recommendations.recommendedRatingRange
  const topUpsolve = report.upsolvingAnalysis[0]
  const commonFailure = report.verdictAnalysis.mostCommonFailedVerdict
  let answer

  if (question.includes('upsolv')) {
    answer = topUpsolve
      ? `Start with ${topUpsolve.name} (${topUpsolve.problemKey}). It is ${topUpsolve.priorityLevel.toLowerCase()} priority because ${topUpsolve.reason}.`
      : 'Your current history has no unsolved attempted problems. Use a focused mixed set instead.'
  } else if (question.includes('rating')) {
    answer = `Your highest-friction rating range is ${ratingRange.bucket}, with a ${ratingRange.rate}% conversion rate. Build consistency there before moving higher.`
  } else if (
    question.includes('verdict') ||
    question.includes('wrong') ||
    question.includes('tle')
  ) {
    answer = commonFailure
      ? `${commonFailure.name} is your most common failed verdict. Use the verdict-specific topic patterns in your report before the next timed set.`
      : 'No failed-verdict pattern is strong enough yet; collect more contest submissions.'
  } else if (question.includes('weak') || question.includes('topic')) {
    answer = topTopic
      ? `${topTopic.topic} is the best current focus after adjusting for sample size. You solved ${topTopic.solved} of ${topTopic.attempted} attempted problems there.`
      : 'There is not enough tagged activity to identify a reliable weak topic yet.'
  } else if (question.includes('plan') || question.includes('week')) {
    answer = `Use two focused topic sessions, one timed mixed set, and one review day. Keep most problems in the ${ratingRange.bucket} range.`
  } else {
    answer = report.recommendations.practiceStrategy.join(' ')
  }

  return {
    source: 'rule_based',
    aiEnabled: false,
    handle: report.profile.handle,
    question: message,
    answer,
    suggestedActions: report.recommendations.practiceStrategy.slice(0, 3),
    generatedAt: new Date().toISOString(),
  }
}
