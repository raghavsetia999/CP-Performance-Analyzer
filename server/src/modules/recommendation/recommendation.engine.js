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

export function buildRecommendations({
  topicAnalysis,
  ratingAnalysis,
  verdictAnalysis,
  upsolvingAnalysis,
}) {
  const focusTopics = rankFocusTopics(topicAnalysis)
  const recommendedRatingRange = pickRatingRange(ratingAnalysis)
  const recommendedProblems = upsolvingAnalysis.slice(0, 8).map((problem) => ({
    id: problem.contest,
    problemKey: problem.problemKey,
    name: problem.name,
    rating: problem.rating,
    tags: problem.tags,
    url: problem.url,
    priority: problem.priorityLevel,
    reason: problem.reason,
  }))

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
    upsolvingPriority: upsolvingAnalysis.slice(0, 5),
    practiceStrategy,
  }
}
