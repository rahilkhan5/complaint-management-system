import assert from 'node:assert/strict'
import { after, afterEach, before, beforeEach, describe, it } from 'node:test'
import { DEMO_PASSWORD, seedDemoData } from '../src/demo/seedDemoData.js'
import { api, auth, clearDb, createUser, startDb, stopDb } from './helpers.js'

before(startDb)
after(stopDb)
beforeEach(clearDb)
afterEach(() => {
  delete process.env.DEMO_MODE
})

const login = async (email) =>
  (await api().post('/api/auth/login').send({ email, password: DEMO_PASSWORD })).body.token

describe('demo data', () => {
  it('creates the demo accounts and complaints', async () => {
    const counts = await seedDemoData()
    assert.deepEqual(counts, { users: 6, complaints: 10 })

    const token = await login('admin@demo.com')
    const list = await api().get('/api/complaints?limit=50').set(auth(token))
    assert.equal(list.body.total, 10)
    assert.equal(list.body.items.at(-1).caseNumber, 'CMS-0001')
  })
})

describe('demo mode', () => {
  it('keeps the shared demo accounts from being changed', async () => {
    await seedDemoData()
    process.env.DEMO_MODE = 'true'
    const admin = await login('admin@demo.com')

    const password = await api()
      .patch('/api/auth/password')
      .set(auth(admin))
      .send({ currentPassword: DEMO_PASSWORD, newPassword: 'Changed123' })
    assert.equal(password.status, 403)

    const details = await api()
      .patch('/api/auth/me')
      .set(auth(admin))
      .send({ name: 'Someone else', email: 'admin@demo.com' })
    assert.equal(details.status, 403)

    const staff = await api().get('/api/users?role=agent').set(auth(admin))
    const turnOff = await api().patch(`/api/users/${staff.body[0]._id}`).set(auth(admin)).send({ isActive: false })
    assert.equal(turnOff.status, 403)

    // The demo login still works for the next visitor
    assert.ok(await login('admin@demo.com'))
  })

  it('still lets people change their own accounts', async () => {
    process.env.DEMO_MODE = 'true'
    const admin = await createUser('admin')
    const agent = await createUser('agent')

    const turnOff = await api().patch(`/api/users/${agent.user._id}`).set(auth(admin.token)).send({ isActive: false })
    assert.equal(turnOff.status, 200)

    const password = await api()
      .patch('/api/auth/password')
      .set(auth(admin.token))
      .send({ currentPassword: 'Password123', newPassword: 'Changed123' })
    assert.equal(password.status, 200)
  })

  it('tells the app when it is running as the live demo', async () => {
    assert.equal((await api().get('/api/health')).body.demo, false)
    process.env.DEMO_MODE = 'true'
    assert.equal((await api().get('/api/health')).body.demo, true)
  })
})
