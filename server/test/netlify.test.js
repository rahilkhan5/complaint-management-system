import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import { after, before, beforeEach, describe, it } from 'node:test'
import { resetDemoIfStale } from '../src/demo/resetDemoIfStale.js'
import { clearDb, startDb, stopDb } from './helpers.js'

before(startDb)
after(stopDb)
beforeEach(clearDb)

describe('demo reset', () => {
  it('resets once, then waits 6 hours before the next reset', async () => {
    assert.equal(await resetDemoIfStale(), true)
    assert.equal(await resetDemoIfStale(), false)

    const sevenHoursAgo = new Date(Date.now() - 7 * 60 * 60 * 1000)
    await mongoose.connection.collection('demostate').updateOne({ _id: 'demo' }, { $set: { seededAt: sevenHoursAgo } })
    assert.equal(await resetDemoIfStale(), true)
  })

  it('lets only one of two copies starting together do the reset', async () => {
    const results = await Promise.all([resetDemoIfStale(), resetDemoIfStale()])
    assert.deepEqual(results.sort(), [false, true])
  })
})

describe('Netlify function', () => {
  it('serves the API on /api paths and on its own function path', async () => {
    // The test database is already connected, so the function does not need a MONGO_URI
    delete process.env.MONGO_URI
    const { handler } = await import('../functions/api.js')
    const call = (path, extra = {}) =>
      handler(
        {
          path,
          httpMethod: 'GET',
          headers: {},
          queryStringParameters: null,
          multiValueQueryStringParameters: null,
          body: null,
          isBase64Encoded: false,
          ...extra,
        },
        {},
      )

    const health = await call('/api/health')
    assert.equal(health.statusCode, 200)
    assert.equal(JSON.parse(health.body).demo, true)

    assert.equal((await call('/.netlify/functions/api/health')).statusCode, 200)

    // The function loaded the demo data on its first request, so the demo login works
    const login = await call('/api/auth/login', {
      httpMethod: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'admin@demo.com', password: 'Demo@1234' }),
    })
    assert.equal(login.statusCode, 200)
    assert.ok(JSON.parse(login.body).token)
  })
})
