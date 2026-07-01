const topicAliases = {
  'dynamic programming': ['dynamic programming', 'dp'],
  graphs: ['graph', 'graphs', 'dfs', 'bfs'],
  'binary search': ['binary search'],
  'number theory': ['number theory'],
  'data structures': ['data structure', 'data structures'],
  'brute force': ['brute force'],
  'two pointers': ['two pointer', 'two pointers'],
  'shortest paths': ['shortest path', 'shortest paths'],
  'divide and conquer': ['divide and conquer'],
  strings: ['string', 'strings'],
  trees: ['tree', 'trees'],
  mathematics: ['math', 'mathematics'],
}

function normalizedWords(value) {
  return ` ${String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()} `
}

function topicTerms(topic) {
  const name = topic.topic.toLowerCase()
  return [...new Set([name, topic.short?.toLowerCase(), ...(topicAliases[name] || [])])]
    .filter(Boolean)
    .sort((left, right) => right.length - left.length)
}

export function findRequestedTopic(report, message) {
  const question = normalizedWords(message)
  const topics = report.topicAnalysis || report.recommendations?.focusTopics || []
  return topics.find((topic) =>
    topicTerms(topic).some((term) => question.includes(normalizedWords(term))),
  )
}

function parseRatingRange(message) {
  const range = message.match(/\b(\d{3,4})\s*(?:-|–|—|to)\s*(\d{3,4})\b/i)
  if (range) {
    const first = Number(range[1])
    const second = Number(range[2])
    return { min: Math.min(first, second), max: Math.max(first, second) }
  }

  const single = message.match(/\b(?:rating|rated|around|for)\s*(\d{3,4})\b/i)
  if (!single) return null
  const target = Number(single[1])
  return { min: target, max: target }
}

function detectIntent(question, requestedTopic) {
  const includes = (...terms) => terms.some((term) => question.includes(term))
  if (includes('upsolv')) return 'upsolving_plan'
  if (requestedTopic && includes('weak', 'why', 'explain', 'improve', 'struggle', 'bad')) {
    return 'topic_analysis'
  }
  if (
    includes('recommend', 'suggest', 'find', 'which') &&
    includes('problem', 'practice', 'solve')
  ) {
    return 'problem_recommendation'
  }
  if (includes('wrong answer', ' wa ', 'tle', 'time limit', 'verdict', 'runtime', 'compile')) {
    return 'verdict_analysis'
  }
  if (includes('rating', 'rated', 'range')) return 'rating_analysis'
  if (includes('contest', 'performance', 'speed', 'rank')) return 'contest_strategy'
  if (includes('plan', 'week', 'schedule', 'routine')) return 'practice_plan'
  if (requestedTopic) return 'topic_analysis'
  return 'general_coaching'
}

function bucketBounds(bucket) {
  if (bucket.key === 'unrated') return null
  if (bucket.key === '1800+') return { min: 1800, max: Number.POSITIVE_INFINITY }
  const [min, max] = bucket.key.split('-').map(Number)
  return { min, max }
}

function overlapsRange(bucket, range) {
  if (!range) return bucket.attempted > 0
  const bounds = bucketBounds(bucket)
  return Boolean(bounds && bounds.min <= range.max && bounds.max >= range.min)
}

function problemMatchesTopic(problem, topic) {
  if (!topic) return true
  const terms = new Set(topicTerms(topic).map((term) => normalizedWords(term).trim()))
  return (problem.tags || []).some((tag) => {
    const normalizedTag = normalizedWords(tag).trim()
    return terms.has(normalizedTag) || (normalizedTag === 'dp' && terms.has('dynamic programming'))
  })
}

function problemMatchesRating(problem, range) {
  if (!range) return true
  if (problem.rating == null) return false
  if (range.min === range.max) return Math.abs(problem.rating - range.min) <= 100
  return problem.rating >= range.min && problem.rating <= range.max
}

function compactProblem(problem) {
  return {
    problemKey: problem.problemKey,
    name: problem.name,
    rating: problem.rating,
    tags: problem.tags?.slice(0, 6) || [],
    reason: problem.reason,
    priorityLevel: problem.priorityLevel || problem.priority,
    attempts: problem.attempts,
    url: problem.url,
  }
}

function topicEvidence(topic) {
  if (!topic) return []
  const evidence = [
    {
      label: `${topic.topic} conversion`,
      value: `${topic.solved} of ${topic.attempted} solved (${topic.rate}%)`,
    },
    { label: 'Weakness score', value: `${topic.weakness}/100` },
  ]
  if (topic.unsolved != null) {
    evidence.push({
      label: 'Unsolved attempts',
      value: String(topic.unsolved),
    })
  }
  if (topic.verdicts) {
    evidence.push({
      label: 'Failure pattern',
      value: `${topic.verdicts.wrongAnswer || 0} WA · ${topic.verdicts.timeLimit || 0} TLE`,
    })
  }
  return evidence
}

function ratingEvidence(bands, requestedRange) {
  if (!bands.length) return []
  const attempted = bands.reduce((sum, band) => sum + band.attempted, 0)
  const solved = bands.reduce((sum, band) => sum + band.solved, 0)
  const label = requestedRange
    ? requestedRange.min === requestedRange.max
      ? `Around ${requestedRange.min}`
      : `${requestedRange.min}–${requestedRange.max}`
    : bands.map((band) => band.bucket).join(', ')
  return [
    {
      label: `${label} conversion`,
      value: `${solved} of ${attempted} solved (${attempted ? Math.round((solved / attempted) * 100) : 0}%)`,
    },
    {
      label: 'Failed submissions',
      value: String(bands.reduce((sum, band) => sum + (band.failed || 0), 0)),
    },
  ]
}

export function buildCoachQuestionContext(report, message) {
  const normalizedQuestion = normalizedWords(message)
  const requestedTopic = findRequestedTopic(report, message)
  const requestedRatingRange = parseRatingRange(message)
  const intent = detectIntent(normalizedQuestion, requestedTopic)
  const relevantRatingBands =
    requestedRatingRange || intent === 'rating_analysis' || intent === 'contest_strategy'
      ? (report.ratingAnalysis || []).filter((band) => overlapsRange(band, requestedRatingRange))
      : []
  const availableProblems =
    intent === 'upsolving_plan'
      ? report.upsolvingAnalysis || []
      : [
          ...(report.recommendations?.recommendedProblems || []),
          ...(report.upsolvingAnalysis || []),
        ]
  const problemKeys = new Set()
  const relevantProblems = availableProblems
    .filter(
      (problem) =>
        problemMatchesTopic(problem, requestedTopic) &&
        problemMatchesRating(problem, requestedRatingRange),
    )
    .filter((problem) => {
      if (problemKeys.has(problem.problemKey)) return false
      problemKeys.add(problem.problemKey)
      return true
    })
    .slice(0, 6)
    .map(compactProblem)

  let evidence = []
  if (requestedTopic) evidence.push(...topicEvidence(requestedTopic))
  if (requestedRatingRange || intent === 'rating_analysis') {
    evidence.push(...ratingEvidence(relevantRatingBands, requestedRatingRange))
  }
  if (intent === 'verdict_analysis' || intent === 'contest_strategy') {
    const verdict = report.verdictAnalysis || {}
    evidence.push(
      {
        label: 'Most common failure',
        value: verdict.mostCommonFailedVerdict?.name || 'No strong failure pattern',
      },
      {
        label: 'First-try solves',
        value: String(verdict.firstTrySolvedProblems || 0),
      },
      {
        label: 'Multi-attempt solves',
        value: String(verdict.multiAttemptSolvedProblems || 0),
      },
    )
  }
  if (!evidence.length) {
    const summary = report.summary || {}
    evidence = [
      {
        label: 'Solved problems',
        value: String(summary.solvedProblems ?? 'Not available'),
      },
      {
        label: 'Problem conversion',
        value: summary.acRate == null ? 'Not available' : `${summary.acRate}%`,
      },
      {
        label: 'Highest-priority topic',
        value: report.recommendations?.focusTopics?.[0]?.topic || 'Not enough data',
      },
    ]
  }

  return {
    intent,
    requestedTopic: requestedTopic
      ? {
          topic: requestedTopic.topic,
          short: requestedTopic.short,
          attempted: requestedTopic.attempted,
          solved: requestedTopic.solved,
          unsolved: requestedTopic.unsolved,
          rate: requestedTopic.rate,
          weakness: requestedTopic.weakness,
          avgAttemptsBeforeAc: requestedTopic.avgAttemptsBeforeAc,
          verdicts: requestedTopic.verdicts,
          assessment:
            requestedTopic.attempted < 3
              ? 'insufficient_sample'
              : (requestedTopic.weakness ?? 0) >= 60 || requestedTopic.rate < 60
                ? 'supported_weakness'
                : 'not_a_strong_weakness',
        }
      : null,
    requestedRatingRange,
    relevantRatingBands,
    relevantProblems,
    evidence: evidence.slice(0, 6),
  }
}

export function responseMatchesQuestion(result, questionContext) {
  const responseText = normalizedWords(
    `${result.answer} ${(result.suggestedActions || []).join(' ')}`,
  )
  const topic = questionContext.requestedTopic
  if (topic) {
    const topicMentioned = [topic.topic, topic.short]
      .filter(Boolean)
      .some((term) => responseText.includes(normalizedWords(term)))
    if (!topicMentioned) return false
    if (topic.assessment === 'not_a_strong_weakness') {
      const rejectsFalsePremise = [
        ' does not ',
        ' not a ',
        ' not currently ',
        ' no strong ',
        ' is not ',
      ].some((phrase) => responseText.includes(phrase))
      if (!rejectsFalsePremise) return false
    }
    if (
      topic.assessment === 'insufficient_sample' &&
      ![' not enough ', ' insufficient ', ' too few '].some((phrase) =>
        responseText.includes(phrase),
      )
    ) {
      return false
    }
  }

  const range = questionContext.requestedRatingRange
  if (range) {
    if (!responseText.includes(String(range.min))) return false
    if (range.max !== range.min && !responseText.includes(String(range.max))) return false
  }

  if (
    questionContext.intent === 'problem_recommendation' &&
    questionContext.relevantProblems.length
  ) {
    const mentionsKnownProblem = questionContext.relevantProblems.some((problem) =>
      [problem.name, problem.problemKey]
        .filter(Boolean)
        .some((value) => responseText.includes(normalizedWords(value))),
    )
    if (!mentionsKnownProblem) return false
  }

  if (
    ['topic_analysis', 'rating_analysis', 'verdict_analysis', 'contest_strategy'].includes(
      questionContext.intent,
    )
  ) {
    const evidenceNumbers = [
      ...new Set(
        questionContext.evidence.flatMap((fact) => String(fact.value).match(/\d+/g) || []),
      ),
    ]
    const matchedNumbers = evidenceNumbers.filter((number) => responseText.includes(number))
    if (evidenceNumbers.length >= 2 && matchedNumbers.length < 2) return false
  }

  return true
}
