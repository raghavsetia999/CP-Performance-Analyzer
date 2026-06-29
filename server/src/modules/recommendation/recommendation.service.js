import { analyzeHandle } from '../analytics/analytics.service.js'

export async function getRecommendations(handle) {
  const report = await analyzeHandle(handle)
  return report.recommendations
}
