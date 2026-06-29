import { analyzeHandle } from '../analytics/analytics.service.js'
import {
  answerCoachQuestion,
  generatePracticePlanFromReport,
  generateUpsolvingPlanFromReport,
} from './ai.engine.js'

export async function createPracticePlan(input) {
  const report = await analyzeHandle(input.handle)
  return generatePracticePlanFromReport(report, input)
}

export async function createUpsolvingPlan(input) {
  const report = await analyzeHandle(input.handle)
  return generateUpsolvingPlanFromReport(report)
}

export async function chatWithCoach(input) {
  const report = await analyzeHandle(input.handle)
  return answerCoachQuestion(report, input.message)
}
