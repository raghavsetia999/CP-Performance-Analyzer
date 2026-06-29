import { codeforcesClient } from './codeforces.client.js'
import {
  mapCodeforcesProfile,
  mapCodeforcesRatingChange,
  mapCodeforcesSubmission,
} from './codeforces.mapper.js'

export async function getCodeforcesProfile(handle) {
  return mapCodeforcesProfile(await codeforcesClient.getUser(handle))
}

export async function getCodeforcesSubmissions(handle) {
  const submissions = await codeforcesClient.getSubmissions(handle)
  return submissions.map(mapCodeforcesSubmission)
}

export async function getCodeforcesRatingHistory(handle) {
  const history = await codeforcesClient.getRatingHistory(handle)
  return history.map(mapCodeforcesRatingChange)
}

export async function getCodeforcesSnapshot(handle) {
  const [profile, submissions, ratingHistory] = await Promise.all([
    getCodeforcesProfile(handle),
    getCodeforcesSubmissions(handle),
    getCodeforcesRatingHistory(handle),
  ])

  return {
    profile,
    submissions,
    ratingHistory,
    fetchedAt: new Date().toISOString(),
  }
}
