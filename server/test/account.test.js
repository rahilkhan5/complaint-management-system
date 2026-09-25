import assert from 'node:assert/strict'
import { after, before, beforeEach, describe, it } from 'node:test'
import { api, auth, clearDb, createUser, startDb, stopDb } from './helpers.js'

before(startDb)
after(stopDb)
beforeEach(clearDb)

const details = (overrides = {}) => ({
  name: 'Rahil Khan',
  email: 'rahil@example.com',
  phone: '0300 1234567',
  address: 'Block B, House 9',
  ...overrides,
})

describe('my account', () => {
  it('updates my own details and ignores role or active status', async () => {
    const resident = await createUser('resident')

    const res = await api()
      .patch('/api/auth/me')
      .set(auth(resident.token))
      .send({ ...details({ email: 'Rahil@Example.com' }), role: 'admin', isActive: false })

    assert.equal(res.status, 200)
    assert.equal(res.body.user.name, 'Rahil Khan')
    assert.equal(res.body.user.email, 'rahil@example.com')
    assert.equal(res.body.user.role, 'resident')
    assert.equal(res.body.user.isActive, true)
    assert.equal(res.body.user.password, undefined)
    assert.equal(res.body.user.tokenVersion, undefined)
  })

  it('checks the details before saving', async () => {
    await createUser('agent', { email: 'taken@example.com' })
    const resident = await createUser('resident')
    const send = (body) => api().patch('/api/auth/me').set(auth(resident.token)).send(body)

    assert.equal((await send(details({ email: 'taken@example.com' }))).status, 409)
    assert.equal((await send(details({ email: 'not-an-email' }))).status, 400)
    assert.equal((await send(details({ name: '  ' }))).status, 400)
    // Residents need an address so the team can find them
    assert.equal((await send(details({ address: '' }))).status, 400)
  })

  it('lets staff save without an address', async () => {
    const admin = await createUser('admin')
    const res = await api()
      .patch('/api/auth/me')
      .set(auth(admin.token))
      .send(details({ address: '' }))
    assert.equal(res.status, 200)
  })

  it('needs the current password to set a new one', async () => {
    const agent = await createUser('agent')
    const change = (body) => api().patch('/api/auth/password').set(auth(agent.token)).send(body)

    const wrong = await change({ currentPassword: 'WrongPass1', newPassword: 'NewPassword1' })
    assert.equal(wrong.status, 400)

    const short = await change({ currentPassword: 'Password123', newPassword: 'short' })
    assert.equal(short.status, 400)

    const same = await change({ currentPassword: 'Password123', newPassword: 'Password123' })
    assert.equal(same.status, 400)

    // A typo in the current password must not log the user out
    const stillIn = await api().get('/api/auth/me').set(auth(agent.token))
    assert.equal(stillIn.status, 200)
  })

  it('changes the password and logs out old sessions', async () => {
    const agent = await createUser('agent', { email: 'agent@example.com' })

    const res = await api()
      .patch('/api/auth/password')
      .set(auth(agent.token))
      .send({ currentPassword: 'Password123', newPassword: 'NewPassword1' })
    assert.equal(res.status, 200)
    assert.ok(res.body.token)

    const oldToken = await api().get('/api/auth/me').set(auth(agent.token))
    assert.equal(oldToken.status, 401)

    const newToken = await api().get('/api/auth/me').set(auth(res.body.token))
    assert.equal(newToken.status, 200)

    const oldLogin = await api().post('/api/auth/login').send({ email: 'agent@example.com', password: 'Password123' })
    assert.equal(oldLogin.status, 401)

    const newLogin = await api().post('/api/auth/login').send({ email: 'agent@example.com', password: 'NewPassword1' })
    assert.equal(newLogin.status, 200)
  })
})
