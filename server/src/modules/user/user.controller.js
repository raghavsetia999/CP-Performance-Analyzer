import { successResponse } from '../../utils/ApiResponse.js'
import { updateCodeforcesHandle, updateUserPreferences, updateUserProfile } from './user.service.js'

export function getProfile(request, response) {
  response.json(successResponse({ user: request.user.toPublicJSON() }))
}

export async function patchProfile(request, response) {
  const user = await updateUserProfile(request.user, request.body)
  response.json(successResponse({ user: user.toPublicJSON() }))
}

export async function patchHandle(request, response) {
  const user = await updateCodeforcesHandle(request.user, request.body.codeforcesHandle)
  response.json(successResponse({ user: user.toPublicJSON() }))
}

export async function patchPreferences(request, response) {
  const user = await updateUserPreferences(request.user, request.body)
  response.json(successResponse({ user: user.toPublicJSON() }))
}
