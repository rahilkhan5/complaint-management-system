import User from '../models/User.js'
import { httpError } from '../utils/httpError.js'
import { signToken } from '../utils/token.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function authResponse(user) {
  return { token: signToken(user), user }
}

// POST /api/auth/register  (public, always creates a resident)
export async function register(req, res) {
  const { name, email, password, phone, address } = req.body

  if (!name?.trim() || !email?.trim() || !password || !address?.trim()) {
    throw httpError(400, 'Name, email, password and address are required')
  }
  if (!EMAIL_PATTERN.test(email)) {
    throw httpError(400, 'Please enter a valid email address')
  }
  if (password.length < 8) {
    throw httpError(400, 'Password must be at least 8 characters')
  }

  const exists = await User.exists({ email: email.toLowerCase().trim() })
  if (exists) {
    throw httpError(409, 'An account with this email already exists')
  }

  const user = await User.create({ name, email, password, phone, address, role: 'resident' })
  res.status(201).json(authResponse(user))
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    throw httpError(400, 'Email and password are required')
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password')
  const passwordOk = user && (await user.comparePassword(password))

  // Same message for both cases so nobody can guess which emails are registered
  if (!passwordOk) {
    throw httpError(401, 'Email or password is incorrect')
  }
  if (!user.isActive) {
    throw httpError(403, 'This account has been deactivated. Contact the complaint center')
  }

  res.json(authResponse(user))
}

// GET /api/auth/me
export function me(req, res) {
  res.json({ user: req.user })
}
