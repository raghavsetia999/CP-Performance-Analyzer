import { buildCoachQuestionContext } from './ai.query.js'

const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function explainTopicWeakness(topic) {
  const attempted = topic.attempted || 0
  const solved = topic.solved || 0
  const rate = topic.rate ?? (attempted ? Math.round((solved / attempted) * 100) : 0)
  const evidence = []

  if (topic.unsolved > 0)
    evidence.push(
      `${topic.unsolved} attempted problem${topic.unsolved === 1 ? ' remains' : 's remain'} unsolved`,
    )
  if (topic.avgAttemptsBeforeAc > 2) {
    evidence.push(`accepted solutions took ${topic.avgAttemptsBeforeAc} attempts on average`)
  }
  if (topic.verdicts?.wrongAnswer > 0) {
    evidence.push(
      `${topic.verdicts.wrongAnswer} wrong-answer submission${topic.verdicts.wrongAnswer === 1 ? '' : 's'}`,
    )
  }
  if (topic.verdicts?.timeLimit > 0) {
    evidence.push(
      `${topic.verdicts.timeLimit} time-limit submission${topic.verdicts.timeLimit === 1 ? '' : 's'}`,
    )
  }

  if (attempted < 3) {
    return `There is not enough ${topic.topic} data to conclude that it is a reliable weakness. You attempted ${attempted} tagged problem${attempted === 1 ? '' : 's'} and solved ${solved}; collect at least three to five attempts before treating the score as stable.`
  }

  const assessment =
    (topic.weakness ?? 0) >= 60 || rate < 60
      ? `The data supports treating ${topic.topic} as a current weakness.`
      : `Your data does not show a strong ${topic.topic} weakness yet.`
  const reason = evidence.length
    ? `The main signals are ${evidence.join(', ')}.`
    : 'There is no strong repeated-failure pattern beyond the solve rate.'

  return `${assessment} You solved ${solved} of ${attempted} attempted problems (${rate}% conversion), with a weakness score of ${topic.weakness ?? 'not enough data'} out of 100. ${reason}`
}

function topicActions(topic, ratingRange) {
  const actions = [
    `Solve three ${topic.topic} problems in the ${ratingRange.bucket} range and record the state or invariant before coding.`,
  ]
  if (topic.verdicts?.wrongAnswer > 0) {
    actions.push(
      `For ${topic.topic}, test base cases, transitions, and boundary states before submitting.`,
    )
  } else {
    actions.push(
      `After each ${topic.topic} problem, write the key observation and why the chosen state or approach is sufficient.`,
    )
  }
  if (topic.verdicts?.timeLimit > 0) {
    actions.push(
      'Calculate the time complexity from the state count and transitions before implementation.',
    )
  } else {
    actions.push(`Re-solve one failed ${topic.topic} problem without an editorial within 48 hours.`)
  }
  return actions.slice(0, 3)
}

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
  const questionContext = buildCoachQuestionContext(report, message)
  const topTopic = report.recommendations.focusTopics[0]
  const ratingRange = report.recommendations.recommendedRatingRange
  const topUpsolve = report.upsolvingAnalysis[0]
  const commonFailure = report.verdictAnalysis.mostCommonFailedVerdict
  const requestedTopic = questionContext.requestedTopic
  let answer
  let suggestedActions = report.recommendations.practiceStrategy.slice(0, 3)

  if (questionContext.intent === 'upsolving_plan') {
    const problems = questionContext.relevantProblems.length
      ? questionContext.relevantProblems
      : report.upsolvingAnalysis.slice(0, 3)
    answer = problems.length
      ? `Start your upsolving block with ${problems
          .slice(0, 3)
          .map((problem) => `${problem.name} (${problem.problemKey})`)
          .join(
            ', ',
          )}. This order prioritizes unfinished work with the strongest learning value from your history.`
      : 'Your current history has no unsolved attempted problems, so use a focused mixed practice set instead.'
    suggestedActions = problems.length
      ? [
          `Day 1: Re-attempt ${problems[0].name} without opening the editorial for 30 minutes.`,
          'Day 2: Read only the missing idea, close the editorial, and implement from memory.',
          'Day 3: Re-solve the hardest completed problem and write the key observation.',
        ]
      : suggestedActions
  } else if (questionContext.intent === 'problem_recommendation') {
    const problems = questionContext.relevantProblems
    const topicLabel = requestedTopic?.topic ? ` for ${requestedTopic.topic}` : ''
    const range = questionContext.requestedRatingRange
    const rangeLabel = range
      ? range.min === range.max
        ? ` around ${range.min}`
        : ` in ${range.min}–${range.max}`
      : ''
    answer = problems.length
      ? `The strongest verified recommendations${topicLabel}${rangeLabel} are ${problems
          .slice(0, 4)
          .map(
            (problem) => `${problem.name} (${problem.problemKey}, ${problem.rating ?? 'unrated'})`,
          )
          .join(
            ', ',
          )}. These come from your current recommendation and upsolving queues, not invented problem names.`
      : `There are no verified recommendations${topicLabel}${rangeLabel} in the current snapshot. Refresh the analysis or widen the requested range.`
    suggestedActions = problems
      .slice(0, 3)
      .map(
        (problem, index) =>
          `${index + 1}. Solve ${problem.name} (${problem.problemKey})${problem.reason ? ` because ${problem.reason}` : '.'}`,
      )
  } else if (questionContext.intent === 'topic_analysis' && requestedTopic) {
    answer = explainTopicWeakness(requestedTopic)
    suggestedActions = topicActions(requestedTopic, ratingRange)
  } else if (questionContext.intent === 'rating_analysis') {
    const bands = questionContext.relevantRatingBands
    const attempted = bands.reduce((sum, band) => sum + band.attempted, 0)
    const solved = bands.reduce((sum, band) => sum + band.solved, 0)
    const requestedRange = questionContext.requestedRatingRange
    const rangeLabel = requestedRange
      ? requestedRange.min === requestedRange.max
        ? `around ${requestedRange.min}`
        : `${requestedRange.min}–${requestedRange.max}`
      : ratingRange.bucket
    answer = attempted
      ? `In the ${rangeLabel} range, you solved ${solved} of ${attempted} attempted problems (${Math.round((solved / attempted) * 100)}% conversion). ${bands
          .filter((band) => band.attempted)
          .map((band) => `${band.bucket}: ${band.solved}/${band.attempted}`)
          .join('; ')}.`
      : `There is not enough attempted-problem data in the ${rangeLabel} range to make a reliable assessment.`
    suggestedActions = [
      `Complete a five-problem set in the ${rangeLabel} range before changing difficulty.`,
      'Track whether failures come from missing ideas, implementation errors, or time complexity.',
      'Move the range upward only after reaching at least 70% conversion across ten attempts.',
    ]
  } else if (questionContext.intent === 'verdict_analysis') {
    answer = commonFailure
      ? `${commonFailure.name} is your most common failed verdict with ${commonFailure.value ?? commonFailure.count ?? 'multiple'} submissions. Your strongest wrong-answer tags are ${
          report.verdictAnalysis.wrongAnswerHeavyTags
            .slice(0, 3)
            .map((item) => `${item.tag} (${item.count})`)
            .join(', ') || 'not yet clear'
        }, while TLE is concentrated in ${
          report.verdictAnalysis.timeLimitHeavyTags
            .slice(0, 3)
            .map((item) => `${item.tag} (${item.count})`)
            .join(', ') || 'no strong tag pattern'
        }.`
      : 'No failed-verdict pattern is strong enough yet; collect more contest submissions.'
    suggestedActions = [
      'Classify each failed submission as logic, edge case, implementation, or complexity before retrying.',
      'Write three adversarial tests before submitting topics with repeated wrong answers.',
      'Estimate operations and memory before coding topics with repeated TLEs.',
    ]
  } else if (questionContext.intent === 'contest_strategy') {
    answer = `Your current problem conversion is ${report.summary.acRate}% across ${report.summary.attemptedProblems} attempted problems. You have ${report.verdictAnalysis.firstTrySolvedProblems} first-try solves and ${report.verdictAnalysis.multiAttemptSolvedProblems} multi-attempt solves. Focus first on ${topTopic?.topic || 'mixed practice'} and the ${ratingRange.bucket} range.`
    suggestedActions = [
      'Use the first ten minutes to scan every problem and order them by confidence.',
      'Leave a blocked problem after 15–20 minutes unless you have a concrete new observation.',
      'Upsolve every attempted but unsolved contest problem within 48 hours.',
    ]
  } else if (questionContext.intent === 'practice_plan') {
    answer = `Build the week around ${topTopic?.topic || 'mixed practice'} and ${ratingRange.bucket} problems: two focused sessions, one timed mixed set, one upsolving session, and one review session.`
  } else if (requestedTopic) {
    answer = explainTopicWeakness(requestedTopic)
    suggestedActions = topicActions(requestedTopic, ratingRange)
  } else if (topTopic) {
    answer = topTopic
      ? `${topTopic.topic} is the best current focus after adjusting for sample size. You solved ${topTopic.solved} of ${topTopic.attempted} attempted problems there.`
      : 'There is not enough tagged activity to identify a reliable weak topic yet.'
  } else {
    answer = report.recommendations.practiceStrategy.join(' ')
  }

  return {
    source: 'rule_based',
    aiEnabled: false,
    handle: report.profile.handle,
    question: message,
    answer,
    suggestedActions,
    evidence: questionContext.evidence,
    intent: questionContext.intent,
    generatedAt: new Date().toISOString(),
  }
}
