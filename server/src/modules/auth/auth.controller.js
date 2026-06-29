import { successResponse } from '../../utils/ApiResponse.js'
import { accessTokenCookie, authCookieOptions, loginUser, registerUser } from './auth.service.js'

function setSession(response, token) {
  response.cookie(accessTokenCookie, token, authCookieOptions())
}

export async function register(request, response) {
  const { user, token } = await registerUser(request.body)
  setSession(response, token)
  response.status(201).json(successResponse({ user: user.toPublicJSON() }))
}

export async function login(request, response) {
  const { user, token } = await loginUser(request.body)
  setSession(response, token)
  response.json(successResponse({ user: user.toPublicJSON() }))
}

export function logout(_request, response) {
  const { maxAge: _maxAge, ...clearOptions } = authCookieOptions()
  response.clearCookie(accessTokenCookie, clearOptions)
  response.json(successResponse({ loggedOut: true }))
}

export function me(request, response) {
  response.json(successResponse({ user: request.user.toPublicJSON() }))
}
