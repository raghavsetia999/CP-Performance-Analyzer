import { getCodeforcesProblemset, getCodeforcesSnapshot } from '../codeforces/codeforces.service.js'
import { buildRecommendations } from '../recommendation/recommendation.engine.js'
import { ACCEPTED_VERDICT, topicDisplayNames, topicShortNames } from './analytics.constants.js'
import { groupSubmissionsByProblem } from './problemAnalyzer.js'
import { analyzeRatingBands } from './ratingAnalyzer.js'
import { analyzeUpsolving } from './upsolvingAnalyzer.js'
import { analyzeVerdicts } from './verdictAnalyzer.js'
import { calculateWeaknessScore } from './weaknessEngine.js'

export { groupSubmissionsByProblem } from './problemAnalyzer.js'

function daysBetween(date, now) {
  if (!date) return 30
  return Math.max(0, Math.floor((now.getTime() - new Date(date).getTime()) / 86400000))
}

export function analyzeTopics(submissions, now = new Date()) {
  const topics = new Map()

  for (const problem of groupSubmissionsByProblem(submissions)) {
    const acceptedIndex = problem.submissions.findIndex(
      (submission) => submission.verdict === ACCEPTED_VERDICT,
    )
    const solved = acceptedIndex >= 0
    const relevantSubmissions = solved
      ? problem.submissions.slice(0, acceptedIndex + 1)
      : problem.submissions
    const failedSubmissions = relevantSubmissions.filter(
      (submission) => submission.verdict !== ACCEPTED_VERDICT,
    )
    const lastSubmission = problem.submissions.at(-1)

    for (const rawTag of problem.tags) {
      const topicName = topicDisplayNames[rawTag] || rawTag
      const key = topicName.toLowerCase()
      const topic = topics.get(key) || {
        topic: topicName,
        short: topicShortNames[key] || topicName,
        attempted: 0,
        solved: 0,
        failed: 0,
        unsolved: 0,
        wrongAnswerCount: 0,
        timeLimitCount: 0,
        runtimeErrorCount: 0,
        attemptsBeforeAcTotal: 0,
        solvedWithAttempts: 0,
        lastPracticedAt: null,
      }

      topic.attempted += 1
      topic.solved += solved ? 1 : 0
      topic.unsolved += solved ? 0 : 1
      topic.failed += failedSubmissions.length
      topic.wrongAnswerCount += failedSubmissions.filter(
        (submission) => submission.verdict === 'WRONG_ANSWER',
      ).length
      topic.timeLimitCount += failedSubmissions.filter(
        (submission) => submission.verdict === 'TIME_LIMIT_EXCEEDED',
      ).length
      topic.runtimeErrorCount += failedSubmissions.filter((submission) =>
        ['RUNTIME_ERROR', 'MEMORY_LIMIT_EXCEEDED'].includes(submission.verdict),
      ).length

      if (solved) {
        topic.attemptsBeforeAcTotal += relevantSubmissions.length
        topic.solvedWithAttempts += 1
      }
      if (
        lastSubmission?.createdAt &&
        (!topic.lastPracticedAt ||
          new Date(lastSubmission.createdAt) > new Date(topic.lastPracticedAt))
      ) {
        topic.lastPracticedAt = lastSubmission.createdAt
      }

      topics.set(key, topic)
    }
  }

  return [...topics.values()]
    .map((topic) => {
      const rate = topic.attempted ? Math.round((topic.solved / topic.attempted) * 100) : 0
      const daysSincePractice = daysBetween(topic.lastPracticedAt, now)
      const { score, components } = calculateWeaknessScore({ ...topic, daysSincePractice })
      return {
        topic: topic.topic,
        short: topic.short,
        attempted: topic.attempted,
        solved: topic.solved,
        failed: topic.failed,
        unsolved: topic.unsolved,
        rate,
        avgAttemptsBeforeAc: topic.solvedWithAttempts
          ? Number((topic.attemptsBeforeAcTotal / topic.solvedWithAttempts).toFixed(2))
          : null,
        weakness: score,
        last: topic.lastPracticedAt,
        components,
        verdicts: {
          wrongAnswer: topic.wrongAnswerCount,
          timeLimit: topic.timeLimitCount,
          runtimeError: topic.runtimeErrorCount,
        },
      }
    })
    .sort((left, right) => right.weakness - left.weakness)
}

export function createSummary(snapshot, topicAnalysis) {
  const problems = groupSubmissionsByProblem(snapshot.submissions)
  const solved = problems.filter((problem) =>
    problem.submissions.some((submission) => submission.verdict === ACCEPTED_VERDICT),
  ).length
  const latestSubmissionId = snapshot.submissions.reduce(
    (latest, submission) => Math.max(latest, submission.submissionId || 0),
    0,
  )

  return {
    profile: snapshot.profile,
    totalSubmissions: snapshot.submissions.length,
    attemptedProblems: problems.length,
    solvedProblems: solved,
    unsolvedAttemptedProblems: problems.length - solved,
    acRate: problems.length ? Math.round((solved / problems.length) * 100) : 0,
    topWeaknesses: topicAnalysis.slice(0, 5),
    ratingHistory: snapshot.ratingHistory,
    recentActivity: snapshot.submissions.slice(0, 6).map((submission) => ({
      submissionId: submission.submissionId,
      problemKey: submission.problemKey,
      contestId: submission.contestId,
      index: submission.index,
      name: submission.name,
      rating: submission.rating,
      verdict: submission.verdict,
      createdAt: submission.createdAt,
      url: submission.url,
    })),
    source: {
      submissionCount: snapshot.submissions.length,
      latestSubmissionId,
      fetchedAt: snapshot.fetchedAt,
    },
  }
}

export async function analyzeHandle(handle, options = {}) {
  const problemsetRequest = getCodeforcesProblemset(options).catch(() => [])
  const [snapshot, problemCatalog] = await Promise.all([
    getCodeforcesSnapshot(handle, options),
    problemsetRequest,
  ])
  return buildAnalysisFromSnapshot(snapshot, problemCatalog)
}

export function buildAnalysisFromSnapshot(snapshot, problemCatalog = []) {
  const topicAnalysis = analyzeTopics(snapshot.submissions)
  const ratingAnalysis = analyzeRatingBands(snapshot.submissions)
  const verdictAnalysis = analyzeVerdicts(snapshot.submissions)
  const upsolvingAnalysis = analyzeUpsolving(snapshot.submissions, snapshot.profile, topicAnalysis)
  const recommendations = buildRecommendations({
    topicAnalysis,
    ratingAnalysis,
    verdictAnalysis,
    upsolvingAnalysis,
    problemCatalog,
    attemptedProblemKeys: snapshot.submissions.map((submission) => submission.problemKey),
    profile: snapshot.profile,
  })
  const summary = createSummary(snapshot, topicAnalysis)

  return {
    profile: snapshot.profile,
    summary,
    topicAnalysis,
    ratingAnalysis,
    verdictAnalysis,
    upsolvingAnalysis,
    recommendations,
    generatedAt: snapshot.fetchedAt,
    metadata: summary.source,
    cache: { cached: Boolean(snapshot.cached), stale: Boolean(snapshot.stale) },
  }
}
