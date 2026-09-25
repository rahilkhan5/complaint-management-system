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

describe('editing a complaint', () => {
  it('lets the resident fix the details while the complaint is open', async () => {
    const resident = await createUser('resident')
    const complaint = await fileComplaint(resident.token)

    const res = await api()
      .patch(`/api/complaints/${complaint._id}`)
      .set(auth(resident.token))
      .send({ ...validComplaint, title: 'No water in the kitchen tap', location: 'Block A, House 1, Street 3' })

    assert.equal(res.status, 200)
    assert.equal(res.body.title, 'No water in the kitchen tap')
    assert.equal(res.body.caseNumber, complaint.caseNumber)
    const edited = res.body.history.at(-1)
    assert.equal(edited.type, 'edited')
    assert.deepEqual(edited.fields, ['title', 'location'])
  })

  it('does not add a history entry when nothing changed', async () => {
    const resident = await createUser('resident')
    const complaint = await fileComplaint(resident.token)

    const res = await api().patch(`/api/complaints/${complaint._id}`).set(auth(resident.token)).send(validComplaint)
    assert.equal(res.status, 200)
    assert.equal(res.body.history.length, 1)
  })

  it('only lets the resident who filed it edit, and only before work starts', async () => {
    const resident = await createUser('resident')
    const neighbour = await createUser('resident')
    const agent = await createUser('agent')
    const admin = await createUser('admin')
    const complaint = await fileComplaint(resident.token)
    const edit = (token, body = validComplaint) =>
      api().patch(`/api/complaints/${complaint._id}`).set(auth(token)).send(body)

    assert.equal((await edit(neighbour.token)).status, 404)
    assert.equal((await edit(agent.token)).status, 403)
    assert.equal((await edit(resident.token, { ...validComplaint, category: 'Aliens' })).status, 400)
    assert.equal((await edit(resident.token, { ...validComplaint, title: 'Hi' })).status, 400)

    await api().patch(`/api/complaints/${complaint._id}/assign`).set(auth(admin.token)).send({ agentId: agent.user._id })
    await api().patch(`/api/complaints/${complaint._id}/status`).set(auth(agent.token)).send({ status: 'in_progress' })

    const late = await edit(resident.token, { ...validComplaint, title: 'Changed after work started' })
    assert.equal(late.status, 400)
  })
})

describe('removing a comment', () => {
  it('hides the text from everyone except admins', async () => {
    const resident = await createUser('resident')
    const admin = await createUser('admin')
    const complaint = await fileComplaint(resident.token)

    const posted = await api()
      .post(`/api/complaints/${complaint._id}/comments`)
      .set(auth(resident.token))
      .send({ text: 'Something rude' })
    const commentId = posted.body.comments[0]._id

    const removed = await api()
      .patch(`/api/complaints/${complaint._id}/comments/${commentId}/remove`)
      .set(auth(admin.token))
    assert.equal(removed.status, 200)
    assert.equal(removed.body.comments[0].removed, true)
    assert.equal(removed.body.comments[0].text, 'Something rude')
    assert.equal(removed.body.comments[0].removedBy.name, 'admin user')

    const residentView = await api().get(`/api/complaints/${complaint._id}`).set(auth(resident.token))
    assert.equal(residentView.body.comments[0].removed, true)
    assert.equal(residentView.body.comments[0].text, undefined)
    assert.equal(residentView.body.comments[0].removedBy, undefined)

    const again = await api()
      .patch(`/api/complaints/${complaint._id}/comments/${commentId}/remove`)
      .set(auth(admin.token))
    assert.equal(again.status, 400)
  })

  it('only lets admins remove comments', async () => {
    const resident = await createUser('resident')
    const complaint = await fileComplaint(resident.token)
    const posted = await api()
      .post(`/api/complaints/${complaint._id}/comments`)
      .set(auth(resident.token))
      .send({ text: 'My own comment' })

    const res = await api()
      .patch(`/api/complaints/${complaint._id}/comments/${posted.body.comments[0]._id}/remove`)
      .set(auth(resident.token))
    assert.equal(res.status, 403)
  })
})

describe('removing a complaint', () => {
  it('needs a reason and an admin', async () => {
    const resident = await createUser('resident')
    const admin = await createUser('admin')
    const complaint = await fileComplaint(resident.token)
    const remove = (token, body) => api().patch(`/api/complaints/${complaint._id}/remove`).set(auth(token)).send(body)

    assert.equal((await remove(resident.token, { reason: 'Mine' })).status, 403)
    assert.equal((await remove(admin.token, { reason: '   ' })).status, 400)
    assert.equal((await remove(admin.token, { reason: 'Abusive language' })).status, 200)
    assert.equal((await remove(admin.token, { reason: 'Again' })).status, 400)
  })

  it('takes it out of every list and count, and keeps it for admins', async () => {
    const resident = await createUser('resident')
    const agent = await createUser('agent')
    const admin = await createUser('admin')
    const kept = await fileComplaint(resident.token)
    const rude = await fileComplaint(resident.token, { title: 'Rude complaint here' })
    for (const complaint of [kept, rude]) {
      await api().patch(`/api/complaints/${complaint._id}/assign`).set(auth(admin.token)).send({ agentId: agent.user._id })
    }

    await api()
      .patch(`/api/complaints/${rude._id}/remove`)
      .set(auth(admin.token))
      .send({ reason: 'Abusive language' })

    for (const who of [resident, agent, admin]) {
      const list = await api().get('/api/complaints').set(auth(who.token))
      assert.deepEqual(
        list.body.items.map((item) => item.caseNumber),
        [kept.caseNumber],
      )
      const stats = await api().get('/api/complaints/stats').set(auth(who.token))
      assert.equal(stats.body.total, 1)
    }

    const adminStats = await api().get('/api/complaints/stats').set(auth(admin.token))
    assert.equal(adminStats.body.removed, 1)

    const removedList = await api().get('/api/complaints?removed=true').set(auth(admin.token))
    assert.deepEqual(
      removedList.body.items.map((item) => item.caseNumber),
      [rude.caseNumber],
    )

    // Only admins can open the removed list: for a resident the filter is ignored
    const residentTry = await api().get('/api/complaints?removed=true').set(auth(resident.token))
    assert.deepEqual(
      residentTry.body.items.map((item) => item.caseNumber),
      [kept.caseNumber],
    )

    const staff = await api().get('/api/users?role=agent').set(auth(admin.token))
    assert.equal(staff.body[0].activeComplaints, 1)

    const adminView = await api().get(`/api/complaints/${rude._id}`).set(auth(admin.token))
    assert.equal(adminView.status, 200)
    assert.equal(adminView.body.removed, true)
    const entry = adminView.body.history.at(-1)
    assert.equal(entry.type, 'removed')
    assert.equal(entry.note, 'Abusive language')
  })

  it('blocks every change once removed', async () => {
    const resident = await createUser('resident')
    const agent = await createUser('agent')
    const admin = await createUser('admin')
    const complaint = await fileComplaint(resident.token)
    await api()
      .patch(`/api/complaints/${complaint._id}/remove`)
      .set(auth(admin.token))
      .send({ reason: 'Not a real complaint' })
    const url = `/api/complaints/${complaint._id}`

    assert.equal((await api().get(url).set(auth(resident.token))).status, 410)
    assert.equal((await api().patch(url).set(auth(resident.token)).send(validComplaint)).status, 410)
    assert.equal((await api().post(`${url}/comments`).set(auth(resident.token)).send({ text: 'Why?' })).status, 410)

    assert.equal((await api().post(`${url}/comments`).set(auth(admin.token)).send({ text: 'Note' })).status, 400)
    const assign = await api().patch(`${url}/assign`).set(auth(admin.token)).send({ agentId: agent.user._id })
    assert.equal(assign.status, 400)
    const close = await api().patch(`${url}/status`).set(auth(admin.token)).send({ status: 'closed', note: 'Done' })
    assert.equal(close.status, 400)
  })
})
