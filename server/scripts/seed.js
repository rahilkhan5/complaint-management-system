// Fills the database with demo accounts and realistic complaints.
// Run: npm run seed   (WARNING: deletes all existing users and complaints first)
import 'dotenv/config'
import mongoose from 'mongoose'
import { DEMO_PASSWORD, seedDemoData } from '../src/demo/seedDemoData.js'

async function seed() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing in server/.env')
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })

  const counts = await seedDemoData()

  console.log(`Seeded ${counts.users} users and ${counts.complaints} complaints.`)
  console.log(`Demo password for every account: ${DEMO_PASSWORD}`)
  await mongoose.disconnect()
}

seed().catch(async (error) => {
  console.error(error)
  await mongoose.disconnect()
  process.exit(1)
})
