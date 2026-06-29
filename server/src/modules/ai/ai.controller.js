import { successResponse } from '../../utils/ApiResponse.js'
import { chatWithCoach, createPracticePlan, createUpsolvingPlan } from './ai.service.js'

export async function practicePlan(request, response) {
  response.json(successResponse(await createPracticePlan(request.body)))
}

export async function upsolvingPlan(request, response) {
  response.json(successResponse(await createUpsolvingPlan(request.body)))
}

export async function chat(request, response) {
  response.json(successResponse(await chatWithCoach(request.body)))
}
