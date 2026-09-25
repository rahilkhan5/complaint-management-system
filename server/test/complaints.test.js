import assert from 'node:assert/strict'
import { after, before, beforeEach, describe, it } from 'node:test'
import { api, auth, clearDb, createUser, startDb, stopDb, validComplaint } from './helpers.js'

before(startDb)
after(stopDb)
beforeEach(clearDb)

async function fileComplaint(token, overrides = {}) {
  const res = await api()
    .post('/api/complaints')
    .set(auth(token))
    .send({ ...validComplaint, ...overrides })
  assert.equal(res.status, 201)
  return res.body
}

describe('complaints', () => {
  it('gives each new complaint a case number and a created history entry', async () => {
    const { token } = await createUser('resident')
    const first = await fileComplaint(token)
    const second = await fileComplaint(token)

    assert.equal(first.caseNumber, 'CMS-0001')
    assert.equal(second.caseNumber, 'CMS-0002')
    assert.equal(first.status, 'open')
    assert.equal(first.history[0].type, 'created')
  })

  it('validates the complaint form', async () => {
    const { token } = await createUser('resident')
    const res = await api()
      .post('/api/complaints')
      .set(auth(token))
      .send({ ...validComplaint, category: 'Aliens' })
    assert.equal(res.status, 400)
  })

  it('only lets residents file complaints', async () => {
    const { token } = await createUser('agent')
    const res = await api().post('/api/complaints').set(auth(token)).send(validComplaint)
    assert.equal(res.status, 403)
  })

  it('shows residents only their own complaints', async () => {
    const alice = await createUser('resident')
    const bob = await createUser('resident')
    const bobsComplaint = await fileComplaint(bob.token)
    await fileComplaint(alice.token)

    const list = await api().get('/api/complaints').set(auth(alice.token))
    assert.equal(list.body.total, 1)

    const peek = await api().get(`/api/complaints/${bobsComplaint._id}`).set(auth(alice.token))
    assert.equal(peek.status, 404)
  })

  it('runs the full flow: assign, start, resolve, close', async () => {
    const resident = await createUser('resident')
    const agent = await createUser('agent')
    const admin = await createUser('admin')
    const complaint = await fileComplaint(resident.token)
    const url = `/api/complaints/${complaint._id}`

    // Agent cannot touch it before it is assigned
    const early = await api().patch(`${url}/status`).set(auth(agent.token)).send({ status: 'in_progress' })
    assert.equal(early.status, 404)

    const assigned = await api().patch(`${url}/assign`).set(auth(admin.token)).send({ agentId: agent.user._id })
    assert.equal(assigned.status, 200)
    assert.equal(assigned.body.assignedTo.name, 'agent user')

    const started = await api().patch(`${url}/status`).set(auth(agent.token)).send({ status: 'in_progress' })
    assert.equal(started.status, 200)

    const noNote = await api().patch(`${url}/status`).set(auth(agent.token)).send({ status: 'resolved' })
    assert.equal(noNote.status, 400)

    const resolved = await api()
      .patch(`${url}/status`)
      .set(auth(agent.token))
      .send({ status: 'resolved', note: 'Valve replaced' })
    assert.equal(resolved.status, 200)
    assert.ok(resolved.body.resolvedAt)

    // The agent cannot close it, only the resident or an admin
    const agentClose = await api().patch(`${url}/status`).set(auth(agent.token)).send({ status: 'closed' })
    assert.equal(agentClose.status, 403)

    const closed = await api().patch(`${url}/status`).set(auth(resident.token)).send({ status: 'closed' })
    assert.equal(closed.status, 200)
    assert.equal(closed.body.status, 'closed')

    const types = closed.body.history.map((h) => h.status || h.type)
    assert.deepEqual(types, ['open', 'assigned', 'in_progress', 'resolved', 'closed'])
  })

  it('lets the resident reopen a resolved complaint with a note', async () => {
    const resident = await createUser('resident')
    const admin = await createUser('admin')
    const complaint = await fileComplaint(resident.token)
    const url = `/api/complaints/${complaint._id}/status`

    await api().patch(url).set(auth(admin.token)).send({ status: 'in_progress' })
    await api().patch(url).set(auth(admin.token)).send({ status: 'resolved', note: 'Fixed' })

    const reopened = await api()
      .patch(url)
      .set(auth(resident.token))
      .send({ status: 'in_progress', note: 'Still leaking' })
    assert.equal(reopened.status, 200)
    assert.equal(reopened.body.status, 'in_progress')
    assert.equal(reopened.body.resolvedAt, undefined)
  })

  it('rejects impossible status jumps', async () => {
    const resident = await createUser('resident')
    const admin = await createUser('admin')
    const complaint = await fileComplaint(resident.token)

    const res = await api()
      .patch(`/api/complaints/${complaint._id}/status`)
      .set(auth(admin.token))
      .send({ status: 'resolved', note: 'skip ahead' })
    assert.equal(res.status, 400)
  })

  it('adds comments and blocks them once closed', async () => {
    const resident = await createUser('resident')
    const admin = await createUser('admin')
    const complaint = await fileComplaint(resident.token)
    const url = `/api/complaints/${complaint._id}`

    const commented = await api().post(`${url}/comments`).set(auth(resident.token)).send({ text: 'Any update?' })
    assert.equal(commented.status, 201)
    assert.equal(commented.body.comments[0].author.name, 'resident user')

    await api().patch(`${url}/status`).set(auth(admin.token)).send({ status: 'closed', note: 'Duplicate' })
    const late = await api().post(`${url}/comments`).set(auth(resident.token)).send({ text: 'Hello?' })
    assert.equal(late.status, 400)
  })

  it('reports stats scoped to the user', async () => {
    const resident = await createUser('resident')
    const other = await createUser('resident')
    const admin = await createUser('admin')
    await fileComplaint(resident.token)
    await fileComplaint(resident.token)
    await fileComplaint(other.token)

    const mine = await api().get('/api/complaints/stats').set(auth(resident.token))
    assert.equal(mine.body.total, 2)
    assert.equal(mine.body.unassigned, undefined)

    const all = await api().get('/api/complaints/stats').set(auth(admin.token))
    assert.equal(all.body.total, 3)
    assert.equal(all.body.unassigned, 3)
    assert.equal(all.body.byStatus.open, 3)
  })

  it('filters and searches the list', async () => {
    const resident = await createUser('resident')
    await fileComplaint(resident.token, { title: 'Street light broken', category: 'Electricity' })
    await fileComplaint(resident.token)

    const byCategory = await api().get('/api/complaints?category=Electricity').set(auth(resident.token))
    assert.equal(byCategory.body.total, 1)

    const bySearch = await api().get('/api/complaints?q=light').set(auth(resident.token))
    assert.equal(bySearch.body.items[0].title, 'Street light broken')
  })
})

describe('staff management', () => {
  it('lets admins create agents and deactivate them', async () => {
    const admin = await createUser('admin')

    const created = await api().post('/api/users').set(auth(admin.token)).send({
      name: 'New Agent',
      email: 'new.agent@example.com',
      password: 'Password123',
      role: 'agent',
    })
    assert.equal(created.status, 201)

    const deactivated = await api()
      .patch(`/api/users/${created.body._id}`)
      .set(auth(admin.token))
      .send({ isActive: false })
    assert.equal(deactivated.body.isActive, false)

    const self = await api().patch(`/api/users/${admin.user._id}`).set(auth(admin.token)).send({ isActive: false })
    assert.equal(self.status, 400)
  })

  it('keeps non admins out', async () => {
    const agent = await createUser('agent')
    const res = await api().get('/api/users').set(auth(agent.token))
    assert.equal(res.status, 403)
  })
})
