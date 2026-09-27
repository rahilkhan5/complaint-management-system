import 'dotenv/config'
import { randomBytes } from 'node:crypto'
import app from './app.js'
import { connectDB, databaseStatus } from './config/db.js'
import { seedDemoData } from './demo/seedDemoData.js'
import { isDemoMode } from './utils/demo.js'

const PORT = process.env.PORT || 5000

// The live demo may run without a JWT_SECRET: it makes a random one on every start.
// Logins do not survive a restart, but the demo data is reset on restart anyway.
if (isDemoMode() && !process.env.JWT_SECRET) {
  process.env.JWT_SECRET = randomBytes(32).toString('hex')
}

await connectDB()

// The live demo starts from fresh demo data every time the server starts.
// On the free plan the server sleeps when nobody uses it, so each new visitor usually gets a clean demo.
if (isDemoMode() && databaseStatus() === 'connected') {
  const counts = await seedDemoData()
  console.log(`Demo mode: loaded ${counts.users} demo users and ${counts.complaints} complaints`)
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
