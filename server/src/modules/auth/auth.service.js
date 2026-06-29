import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env.js'
import { User } from '../user/user.model.js'
import { ApiError } from '../../utils/ApiError.js'

export const accessTokenCookie = 'accessToken'

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
  const passwordMatches = user ? await bcrypt.compare(input.password, user.passwordHash) : false

  if (!user || !passwordMatches) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'The email or password is incorrect.')
  }

  return { user, token: signAccessToken(user.id) }
}
