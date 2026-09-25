import mongoose from 'mongoose'

const MAX_ATTEMPTS = 5
const RETRY_DELAY_MS = 2000

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function connectDB() {
  const uri = process.env.MONGO_URI

  if (!uri) {
    console.warn('MONGO_URI is not set. The server will start without a database.')
    return
  }

  // Retry a few times: in development the local database may still be starting up
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      // Fail after 5 seconds instead of the default 30 when MongoDB is unreachable
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
      console.log(`MongoDB connected: ${mongoose.connection.host}`)
      return
    } catch (error) {
      console.error(`MongoDB connection failed (attempt ${attempt}/${MAX_ATTEMPTS}): ${error.message}`)
      if (attempt < MAX_ATTEMPTS) await wait(RETRY_DELAY_MS)
    }
  }

  // Keep the API running so /api/health can report the problem
  console.error('Giving up on MongoDB. Check MONGO_URI in server/.env')
}

const STATES = ['disconnected', 'connected', 'connecting', 'disconnecting']

export function databaseStatus() {
  return STATES[mongoose.connection.readyState] || 'unknown'
}
