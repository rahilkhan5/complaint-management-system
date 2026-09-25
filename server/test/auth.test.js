import assert from 'node:assert/strict'
import { after, before, beforeEach, describe, it } from 'node:test'
import { api, auth, clearDb, createUser, startDb, stopDb } from './helpers.js'

before(startDb)
after(stopDb)
beforeEach(clearDb)

describe('auth', () => {
  it('registers a resident and returns a token without the password', async () => {
    const res = await api().post('/api/auth/register').send({
      name: 'Ahmed Raza',
      email: 'Ahmed@Example.com',
      password: 'Password123',
      address: 'Block C, House 27',
    })

    assert.equal(res.status, 201)
    assert.ok(res.body.token)
    assert.equal(res.body.user.email, 'ahmed@example.com')
    assert.equal(res.body.user.role, 'resident')
    assert.equal(res.body.user.password, undefined)
  })

  it('ignores a role sent by the client when registering', async () => {
    const res = await api().post('/api/auth/register').send({
      name: 'Sneaky',
      email: 'sneaky@example.com',
      password: 'Password123',
      address: 'Block C',
      role: 'admin',
    })
    assert.equal(res.status, 201)
    assert.equal(res.body.user.role, 'resident')
  })

  it('rejects a duplicate email', async () => {
    await createUser('resident', { email: 'taken@example.com' })
    const res = await api().post('/api/auth/register').send({
      name: 'Someone',
      email: 'taken@example.com',
      password: 'Password123',
      address: 'Block A',
    })
    assert.equal(res.status, 409)
  })

  it('rejects a short password', async () => {
    const res = await api().post('/api/auth/register').send({
      name: 'Someone',
      email: 'short@example.com',
      password: 'abc',
      address: 'Block A',
    })
    assert.equal(res.status, 400)
  })

  it('logs in with the right password only', async () => {
    await createUser('agent', { email: 'agent@example.com' })

    const wrong = await api().post('/api/auth/login').send({ email: 'agent@example.com', password: 'nope-nope' })
    assert.equal(wrong.status, 401)

    const right = await api().post('/api/auth/login').send({ email: 'agent@example.com', password: 'Password123' })
    assert.equal(right.status, 200)
    assert.equal(right.body.user.role, 'agent')
  })

  it('blocks deactivated accounts from logging in', async () => {
    await createUser('agent', { email: 'gone@example.com', isActive: false })
    const res = await api().post('/api/auth/login').send({ email: 'gone@example.com', password: 'Password123' })
    assert.equal(res.status, 403)
  })

  it('returns the current user from /me and rejects a bad token', async () => {
    const { token } = await createUser('resident')

    const ok = await api().get('/api/auth/me').set(auth(token))
    assert.equal(ok.status, 200)
    assert.equal(ok.body.user.role, 'resident')

    const bad = await api().get('/api/auth/me').set(auth('not-a-real-token'))
    assert.equal(bad.status, 401)
  })
})
