import User from '../models/User.js'
import { httpError } from '../utils/httpError.js'
import { verifyToken } from '../utils/token.js'

// Checks the "Authorization: Bearer <token>" header and loads the logged in user
export async function protect(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    throw httpError(401, 'Please log in to continue')
  }

  let payload
  try {
    payload = verifyToken(token)
  } catch {
    throw httpError(401, 'Your session has expired. Please log in again')
  }

  const user = await User.findById(payload.id)
  if (!user || !user.isActive) {
    throw httpError(401, 'This account is no longer active')
  }

  req.user = user
  next()
}

// Use after protect: authorize('admin') or authorize('agent', 'admin')
export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw httpError(403, 'You do not have permission to do this')
    }
    next()
  }
}
