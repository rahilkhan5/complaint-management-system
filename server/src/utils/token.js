import jwt from 'jsonwebtoken'

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is missing. Add it to server/.env')
  }
  return secret
}

export function signToken(user) {
  const payload = { id: user._id.toString(), role: user.role, v: user.tokenVersion ?? 0 }
  return jwt.sign(payload, getSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

export function verifyToken(token) {
  return jwt.verify(token, getSecret())
}
