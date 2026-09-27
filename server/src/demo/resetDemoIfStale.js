import mongoose from 'mongoose'
import { seedDemoData } from './seedDemoData.js'

const RESET_EVERY_MS = 6 * 60 * 60 * 1000

// Loads fresh demo data if the last reset was more than 6 hours ago. Returns true when it did.
// Serverless hosts start many short-lived copies of the API, so "reset on every start" would wipe the
// demo while someone is using it. Instead exactly one copy claims each reset with an atomic update.
export async function resetDemoIfStale() {
  const state = mongoose.connection.collection('demostate')
  const now = new Date()

  try {
    // Matches only a stale record. If the record is fresh, the upsert tries to insert a second
    // document with the same _id and MongoDB refuses with a duplicate key error (11000).
    await state.updateOne(
      { _id: 'demo', seededAt: { $lt: new Date(now.getTime() - RESET_EVERY_MS) } },
      { $set: { seededAt: now } },
      { upsert: true },
    )
  } catch (error) {
    if (error.code === 11000) return false
    throw error
  }

  await seedDemoData()
  return true
}
