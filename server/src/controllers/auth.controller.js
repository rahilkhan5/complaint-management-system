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

// PATCH /api/auth/me  (any logged in user updates their own details)
export async function updateMe(req, res) {
  const { name, email, phone, address } = req.body
  const user = req.user

  if (!name?.trim() || !email?.trim()) {
    throw httpError(400, 'Name and email are required')
  }
  if (!EMAIL_PATTERN.test(email.trim())) {
    throw httpError(400, 'Please enter a valid email address')
  }
  if (user.role === 'resident' && !address?.trim()) {
    throw httpError(400, 'Please enter your house and street')
  }

  const newEmail = email.toLowerCase().trim()
  if (newEmail !== user.email) {
    const taken = await User.exists({ email: newEmail, _id: { $ne: user._id } })
    if (taken) throw httpError(409, 'An account with this email already exists')
  }

  // Only these fields can change here. Role and active status are never taken from the request
  user.name = name
  user.email = newEmail
  user.phone = phone ?? ''
  user.address = address ?? ''

  try {
    await user.save()
  } catch (error) {
    if (error.name === 'ValidationError') {
      throw httpError(400, Object.values(error.errors)[0].message)
    }
    throw error
  }

  res.json({ user })
}

// PATCH /api/auth/password
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    throw httpError(400, 'Please fill in both password fields')
  }
  if (newPassword.length < 8) {
    throw httpError(400, 'New password must be at least 8 characters')
  }

  const user = await User.findById(req.user._id).select('+password')
  // 400, not 401: a 401 would make the app log the user out for a simple typo
  if (!(await user.comparePassword(currentPassword))) {
    throw httpError(400, 'Your current password is not correct')
  }
  if (currentPassword === newPassword) {
    throw httpError(400, 'Please choose a password different from the current one')
  }

  user.password = newPassword
  // Logs out every other device that still has an old token
  user.tokenVersion = (user.tokenVersion ?? 0) + 1
  await user.save()

  // A fresh token so this device stays logged in
  res.json(authResponse(user))
}
