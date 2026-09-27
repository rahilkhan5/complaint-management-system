import { createHash } from 'node:crypto'
import { httpError } from './httpError.js'

// The live demo runs with DEMO_MODE=true. It loads fresh demo data every few hours (resetDemoIfStale),
// and nobody can lock the shared demo accounts by changing their password or turning them off.
export const isDemoMode = () => process.env.DEMO_MODE === 'true'

// The accounts `npm run seed` creates all use an @demo.com email
const isDemoAccount = (user) => user.email.endsWith('@demo.com')

// The live demo may run without JWT_SECRET. It then derives one from MONGO_URI, which is secret too,
// so every copy of the API (serverless hosts run several at once) signs logins the same way.
export function ensureJwtSecret() {
  if (process.env.JWT_SECRET || !isDemoMode() || !process.env.MONGO_URI) return
  process.env.JWT_SECRET = createHash('sha256').update(`complaint-desk:${process.env.MONGO_URI}`).digest('hex')
}

export function assertDemoAccountUnlocked(user, message) {
  if (isDemoMode() && isDemoAccount(user)) throw httpError(403, message)
}
