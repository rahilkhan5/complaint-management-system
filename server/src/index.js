import 'dotenv/config'
import app from './app.js'
import { connectDB, databaseStatus } from './config/db.js'
import { resetDemoIfStale } from './demo/resetDemoIfStale.js'
import { ensureJwtSecret, isDemoMode } from './utils/demo.js'

const PORT = process.env.PORT || 5000

ensureJwtSecret()

await connectDB()

// The live demo loads fresh demo data when the last reset is more than 6 hours old
if (isDemoMode() && databaseStatus() === 'connected' && (await resetDemoIfStale())) {
  console.log('Demo mode: loaded fresh demo data')
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
