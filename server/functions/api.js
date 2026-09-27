// Netlify Function: runs the Express API on Netlify. netlify.toml sends every /api/* request here.
import serverless from 'serverless-http'
import app from '../src/app.js'
import { connectDB, databaseStatus } from '../src/config/db.js'
import { resetDemoIfStale } from '../src/demo/resetDemoIfStale.js'
import { ensureJwtSecret, isDemoMode } from '../src/utils/demo.js'

// This function only serves the live demo
process.env.DEMO_MODE ??= 'true'
ensureJwtSecret()

const handleRequest = serverless(app)

async function init() {
  // One try only: a function has about 10 seconds per request, no time for the usual retries
  await connectDB({ attempts: 1 })
  if (databaseStatus() !== 'connected') {
    // Try again on the next request instead of staying without a database
    ready = null
    return
  }
  if (isDemoMode()) {
    try {
      await resetDemoIfStale()
    } catch (error) {
      console.error('Demo reset failed:', error.message)
    }
  }
}

// Connect once per warm copy of the function, not on every request
let ready
function prepare() {
  ready ??= init().catch((error) => {
    ready = null
    throw error
  })
  return ready
}

export async function handler(event, context) {
  // Let the response go out while the database connection stays open for the next request
  context.callbackWaitsForEmptyEventLoop = false
  await prepare()
  // Netlify may pass the function's own address instead of /api/...; Express expects /api/...
  const path = event.path.replace(/^\/\.netlify\/functions\/api/, '/api')
  return handleRequest({ ...event, path }, context)
}
