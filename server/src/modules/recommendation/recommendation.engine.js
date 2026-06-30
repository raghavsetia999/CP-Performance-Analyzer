function rankFocusTopics(topicAnalysis) {
  return topicAnalysis
    .map((topic) => ({
      ...topic,
      confidenceAdjustedScore: Math.round(topic.weakness * Math.min(1, topic.attempted / 3)),
    }))
    .sort(
      (left, right) =>
        right.confidenceAdjustedScore - left.confidenceAdjustedScore ||
        right.attempted - left.attempted,
    )
    .slice(0, 3)
    .map((topic) => ({
      topic: topic.topic,
      weakness: topic.weakness,
      attempted: topic.attempted,
      solved: topic.solved,
      rate: topic.rate,
    }))
}

function pickRatingRange(ratingAnalysis) {
  const candidates = ratingAnalysis.filter((bucket) => bucket.attempted >= 3)
  const selected = (
    candidates.length ? candidates : ratingAnalysis.filter((bucket) => bucket.attempted)
  ).sort((left, right) => right.weakness - left.weakness || right.attempted - left.attempted)[0]
  return selected
    ? {
        bucket: selected.bucket,
        weakness: selected.weakness,
        rate: selected.rate,
        weakTags: selected.weakTags,
      }
    : { bucket: '800–1000', weakness: 0, rate: 0, weakTags: [] }
}

const topicTagAliases = {
  'dynamic programming': 'dp',
}

function normalizedFocusTopics(focusTopics) {
  return new Map(
    focusTopics.map((topic) => [
      topicTagAliases[topic.topic.toLowerCase()] || topic.topic.toLowerCase(),
      topic,
    ]),
  )
}

export function rankUnseenProblems({
  problemCatalog = [],
  attemptedProblemKeys = [],
  focusTopics = [],
  profile = {},
  limit = 12,
}) {
  const attempted = new Set(attemptedProblemKeys)
  const focus = normalizedFocusTopics(focusTopics)
  const currentRating = profile.rating || 800
  const lowerBound = Math.max(800, currentRating - 100)
  const upperBound = Math.max(1000, currentRating + 300)

  return problemCatalog
    .filter(
      (problem) =>
        problem.url &&
        problem.rating != null &&
        !attempted.has(problem.problemKey) &&
        problem.rating >= lowerBound - 200 &&
        problem.rating <= upperBound + 200,
    )
    .map((problem) => {
      const matchingTopics = problem.tags
        .map((tag) => focus.get(tag))
        .filter(Boolean)
        .sort((left, right) => right.weakness - left.weakness)
      const strongestTopic = matchingTopics[0]
      const targetRating = Math.min(Math.max(problem.rating, lowerBound), upperBound)
      const ratingDistance = Math.abs(problem.rating - targetRating)
      const topicScore = strongestTopic ? strongestTopic.weakness * 0.65 : 0
      const ratingScore = Math.max(0, 30 - ratingDistance / 10)
      const varietyScore = Math.min(5, problem.tags.length)
      const score = Math.round(topicScore + ratingScore + varietyScore)
      const reason = strongestTopic
        ? `Unseen ${strongestTopic.topic} practice in your ${lowerBound}-${upperBound} improvement range.`
        : `Unseen practice close to your current ${currentRating || 'starting'} rating.`

      return {
        id: `${problem.contestId}${problem.index}`,
        ...problem,
        source: 'unseen_problemset',
        priority: score >= 75 ? 'High' : score >= 50 ? 'Medium' : 'Low',
        matchScore: score,
        reason,
      }
    })
    .sort(
      (left, right) =>
        right.matchScore - left.matchScore ||
        Math.abs(left.rating - currentRating) - Math.abs(right.rating - currentRating) ||
        left.problemKey.localeCompare(right.problemKey),
    )
    .slice(0, limit)
}

export function buildRecommendations({
  topicAnalysis,
  ratingAnalysis,
  verdictAnalysis,
  upsolvingAnalysis,
  problemCatalog = [],
  attemptedProblemKeys = [],
  profile = {},
}) {
  const focusTopics = rankFocusTopics(topicAnalysis)
  const recommendedRatingRange = pickRatingRange(ratingAnalysis)
  const upsolvingProblems = upsolvingAnalysis.slice(0, 8).map((problem) => ({
    id: problem.contest,
    problemKey: problem.problemKey,
    name: problem.name,
    rating: problem.rating,
    tags: problem.tags,
    url: problem.url,
    priority: problem.priorityLevel,
    reason: problem.reason,
    source: 'upsolving',
  }))
  const unseenProblems = rankUnseenProblems({
    problemCatalog,
    attemptedProblemKeys,
    focusTopics,
    profile,
  })
  const recommendedProblems = unseenProblems.length ? unseenProblems : upsolvingProblems

  const practiceStrategy = []
  if (focusTopics[0]) {
    practiceStrategy.push(
      `Spend two focused sessions on ${focusTopics[0].topic} before widening the topic mix.`,
    )
  }
  if (verdictAnalysis.wrongAnswerHeavyTags[0]) {
    practiceStrategy.push(
      `Write invariants and test edge cases for ${verdictAnalysis.wrongAnswerHeavyTags[0].tag} problems to reduce wrong answers.`,
    )
  }
  if (verdictAnalysis.timeLimitHeavyTags[0]) {
    practiceStrategy.push(
      `Estimate complexity before coding ${verdictAnalysis.timeLimitHeavyTags[0].tag} problems.`,
    )
  }
  practiceStrategy.push(
    'Upsolve the highest-priority unfinished problem within 48 hours of practice.',
  )
  practiceStrategy.push(
    'Use one timed mixed set each week to test transfer under contest pressure.',
  )

  return {
    source: 'rule_based',
    focusTopics,
    recommendedRatingRange,
    recommendedProblems,
    unseenProblems,
    upsolvingProblems,
    upsolvingPriority: upsolvingAnalysis.slice(0, 5),
    practiceStrategy,
  }
}
