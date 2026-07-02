import { env } from '../../config/env.js'
import { successResponse } from '../../utils/ApiResponse.js'
import {
  accessTokenCookie,
  authCookieOptions,
  completeGoogleAuthorization,
  createGoogleAuthorization,
  isGoogleOAuthConfigured,
  loginUser,
  oauthStateCookie,
  oauthStateCookieOptions,
  registerUser,
  requestPasswordReset,
  resetPassword as resetPasswordService,
} from './auth.service.js'

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

export function googleStatus(_request, response) {
  response.json(successResponse({ configured: isGoogleOAuthConfigured() }))
}

export function googleStart(_request, response) {
  const { state, url } = createGoogleAuthorization()
  response.cookie(oauthStateCookie, state, oauthStateCookieOptions())
  response.redirect(url)
}

export async function googleCallback(request, response) {
  const { maxAge: _maxAge, ...clearOptions } = oauthStateCookieOptions()
  response.clearCookie(oauthStateCookie, clearOptions)

  if (request.query.error) {
    response.redirect(`${env.CLIENT_ORIGIN}/login?oauth=denied`)
    return
  }

  try {
    const { user, token } = await completeGoogleAuthorization({
      code: request.query.code,
      state: request.query.state,
      expectedState: request.cookies?.[oauthStateCookie],
    })
    setSession(response, token)
    response.redirect(`${env.CLIENT_ORIGIN}/dashboard?oauth=success`)
  } catch {
    response.redirect(`${env.CLIENT_ORIGIN}/login?oauth=failed`)
  }
}

export async function forgotPassword(request, response) {
  const result = await requestPasswordReset(request.body)
  response.status(202).json(
    successResponse({
      ...result,
      message: 'If an account exists for that email, a reset link has been prepared.',
    }),
  )
}

export async function resetPassword(request, response) {
  const { user, token } = await resetPasswordService(request.body)
  setSession(response, token)
  response.json(successResponse({ user: user.toPublicJSON() }))
}
