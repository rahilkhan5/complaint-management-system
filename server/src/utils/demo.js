import { httpError } from './httpError.js'

// The live demo runs with DEMO_MODE=true. It loads fresh demo data every time the server starts,
// and nobody can lock the shared demo accounts by changing their password or turning them off.
export const isDemoMode = () => process.env.DEMO_MODE === 'true'

// The accounts `npm run seed` creates all use an @demo.com email
const isDemoAccount = (user) => user.email.endsWith('@demo.com')

export function assertDemoAccountUnlocked(user, message) {
  if (isDemoMode() && isDemoAccount(user)) throw httpError(403, message)
}
