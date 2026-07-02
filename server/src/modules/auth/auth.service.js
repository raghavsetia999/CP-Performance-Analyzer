import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env.js'
import { User } from '../user/user.model.js'
import { ApiError } from '../../utils/ApiError.js'
import { isPasswordEmailConfigured, sendPasswordResetEmail } from './auth.mail.js'

export const accessTokenCookie = 'accessToken'
export const oauthStateCookie = 'googleOAuthState'

const googleAuthorizationUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
const googleTokenUrl = 'https://oauth2.googleapis.com/token'
const googleUserInfoUrl = 'https://openidconnect.googleapis.com/v1/userinfo'

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function signAccessToken(userId) {
  return jwt.sign({}, env.JWT_SECRET, {
    subject: String(userId),
    expiresIn: env.JWT_EXPIRES_IN,
  })
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  }
}

export function oauthStateCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000,
    path: '/api/auth/google',
  }
}

export async function registerUser(input) {
  const existingUser = await User.findOne({ email: input.email })
  if (existingUser) {
    throw new ApiError(409, 'EMAIL_ALREADY_REGISTERED', 'An account already exists for this email.')
  }

  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS)
  const user = await User.create({
    name: input.name,
    email: input.email,
    passwordHash,
    codeforcesHandle: input.codeforcesHandle || '',
    targetRating: input.targetRating || 1600,
  })

  return { user, token: signAccessToken(user.id) }
}

export async function loginUser(input) {
  const user = await User.findOne({ email: input.email }).select('+passwordHash')
  const passwordMatches = user?.passwordHash
    ? await bcrypt.compare(input.password, user.passwordHash)
    : false

  if (!user || !passwordMatches) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'The email or password is incorrect.')
  }

  return { user, token: signAccessToken(user.id) }
}

export function isGoogleOAuthConfigured() {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)
}

export function createGoogleAuthorization() {
  if (!isGoogleOAuthConfigured()) {
    throw new ApiError(
      503,
      'GOOGLE_OAUTH_NOT_CONFIGURED',
      'Google sign-in is not configured on this server.',
    )
  }

  const state = crypto.randomBytes(32).toString('hex')
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: env.GOOGLE_CALLBACK_URL,
    response_type: 'code',
    scope: 'openid profile email',
    state,
    prompt: 'select_account',
  })

  return { state, url: `${googleAuthorizationUrl}?${params.toString()}` }
}

export async function completeGoogleAuthorization({ code, expectedState, state }) {
  if (!code || !state || !expectedState || state !== expectedState) {
    throw new ApiError(400, 'INVALID_OAUTH_STATE', 'Google sign-in could not be verified.')
  }

  const tokenResponse = await axios.post(
    googleTokenUrl,
    new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_CALLBACK_URL,
      grant_type: 'authorization_code',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 10000 },
  )

  const profileResponse = await axios.get(googleUserInfoUrl, {
    headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` },
    timeout: 10000,
  })
  const profile = profileResponse.data

  if (!profile.sub || !profile.email || !profile.email_verified) {
    throw new ApiError(
      401,
      'GOOGLE_EMAIL_NOT_VERIFIED',
      'Google did not provide a verified email address.',
    )
  }

  const email = profile.email.trim().toLowerCase()
  let user = await User.findOne({ $or: [{ googleId: profile.sub }, { email }] }).select('+googleId')

  if (user?.googleId && user.googleId !== profile.sub) {
    throw new ApiError(409, 'GOOGLE_ACCOUNT_CONFLICT', 'This email is linked to another account.')
  }

  if (!user) {
    user = new User({
      name: profile.name || email.split('@')[0],
      email,
      googleId: profile.sub,
      emailVerified: true,
      profileImageUrl: profile.picture || '',
    })
  } else {
    user.googleId = profile.sub
    user.emailVerified = true
    user.profileImageUrl = profile.picture || user.profileImageUrl
  }

  await user.save()
  return { user, token: signAccessToken(user.id) }
}

export async function requestPasswordReset(input) {
  const user = await User.findOne({ email: input.email })
  if (!user) return { accepted: true }

  const resetToken = crypto.randomBytes(32).toString('hex')
  user.passwordResetTokenHash = hashToken(resetToken)
  user.passwordResetExpiresAt = new Date(
    Date.now() + env.PASSWORD_RESET_EXPIRES_MINUTES * 60 * 1000,
  )
  await user.save()

  const resetUrl = new URL(env.PASSWORD_RESET_URL)
  resetUrl.searchParams.set('token', resetToken)

  if (isPasswordEmailConfigured()) {
    try {
      await sendPasswordResetEmail({
        name: user.name,
        resetUrl: resetUrl.toString(),
        to: user.email,
      })
    } catch (error) {
      console.error('Failed to send password reset email:', error.message)
    }
    return { accepted: true }
  }

  return {
    accepted: true,
    ...(env.NODE_ENV !== 'production' ? { devResetUrl: resetUrl.toString() } : {}),
  }
}

export async function resetPassword(input) {
  const user = await User.findOne({
    passwordResetTokenHash: hashToken(input.token),
    passwordResetExpiresAt: { $gt: new Date() },
  }).select('+passwordHash +passwordResetTokenHash +passwordResetExpiresAt')

  if (!user) {
    throw new ApiError(400, 'INVALID_RESET_TOKEN', 'This reset link is invalid or has expired.')
  }

  user.passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS)
  user.passwordResetTokenHash = undefined
  user.passwordResetExpiresAt = undefined
  await user.save()

  return { user, token: signAccessToken(user.id) }
}
