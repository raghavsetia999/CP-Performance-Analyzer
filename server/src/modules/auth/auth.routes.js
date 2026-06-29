import { Router } from 'express'
import { authMiddleware } from '../../middleware/authMiddleware.js'
import { validateRequest } from '../../middleware/validateRequest.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { login, logout, me, register } from './auth.controller.js'
import { loginSchema, registerSchema } from './auth.validation.js'

export const authRouter = Router()

authRouter.post('/register', validateRequest(registerSchema), asyncHandler(register))
authRouter.post('/login', validateRequest(loginSchema), asyncHandler(login))
authRouter.post('/logout', logout)
authRouter.get('/me', authMiddleware, me)
