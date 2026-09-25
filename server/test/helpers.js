import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import app from '../src/app.js'
import User from '../src/models/User.js'

process.env.JWT_SECRET = 'test-secret'

let mongod

export async function startDb() {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
}

export async function stopDb() {
  await mongoose.disconnect()
  await mongod.stop()
}

export async function clearDb() {
  const collections = await mongoose.connection.db.collections()
  await Promise.all(collections.map((c) => c.deleteMany({})))
}

export const api = () => request(app)

// Creates a user directly in the database and returns a logged in token for them
export async function createUser(role, overrides = {}) {
  const email = overrides.email || `${role}-${Math.random().toString(36).slice(2, 8)}@test.com`
  const user = await User.create({
    name: `${role} user`,
    email,
    password: 'Password123',
    role,
    address: role === 'resident' ? 'Block A, House 1' : undefined,
    ...overrides,
  })
  const res = await api().post('/api/auth/login').send({ email, password: 'Password123' })
  return { user, token: res.body.token }
}

export const auth = (token) => ({ Authorization: `Bearer ${token}` })

export const validComplaint = {
  title: 'No water since morning',
  description: 'There has been no water supply in our house since 7 am today.',
  category: 'Water Supply',
  priority: 'high',
  location: 'Block A, House 1',
}
