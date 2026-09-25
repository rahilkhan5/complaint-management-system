import mongoose from 'mongoose'

export async function connectDB() {
  const uri = process.env.MONGO_URI

  if (!uri) {
    console.warn('MONGO_URI is not set. The server will start without a database.')
    return
  }

  try {
    // Fail after 5 seconds instead of the default 30 when MongoDB is unreachable
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    console.log(`MongoDB connected: ${mongoose.connection.host}`)
  } catch (error) {
    // Keep the API running so /api/health can report the problem
    console.error(`MongoDB connection failed: ${error.message}`)
  }
}

const STATES = ['disconnected', 'connected', 'connecting', 'disconnecting']

export function databaseStatus() {
  return STATES[mongoose.connection.readyState] || 'unknown'
}
