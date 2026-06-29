import { successResponse } from '../../utils/ApiResponse.js'
import { getRecommendations } from './recommendation.service.js'

export async function recommendations(request, response) {
  response.json(
    successResponse(await getRecommendations(request.params.handle), {
      generatedAt: new Date().toISOString(),
      source: 'rule_based',
    }),
  )
}
