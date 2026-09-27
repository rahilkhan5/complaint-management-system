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

describe('restoring a comment', () => {
  it('shows the comment to everyone again', async () => {
    const resident = await createUser('resident')
    const admin = await createUser('admin')
    const complaint = await fileComplaint(resident.token)
    const posted = await api()
      .post(`/api/complaints/${complaint._id}/comments`)
      .set(auth(resident.token))
      .send({ text: 'Removed by mistake' })
    const url = `/api/complaints/${complaint._id}/comments/${posted.body.comments[0]._id}`

    assert.equal((await api().patch(`${url}/restore`).set(auth(admin.token))).status, 400)
    await api().patch(`${url}/remove`).set(auth(admin.token))
    assert.equal((await api().patch(`${url}/restore`).set(auth(resident.token))).status, 403)

    const restored = await api().patch(`${url}/restore`).set(auth(admin.token))
    assert.equal(restored.status, 200)
    const residentView = await api().get(`/api/complaints/${complaint._id}`).set(auth(resident.token))
    assert.equal(residentView.body.comments[0].removed, false)
    assert.equal(residentView.body.comments[0].text, 'Removed by mistake')
  })
})

describe('removing a complaint', () => {
  it('needs an admin and a reason from the list', async () => {
    const resident = await createUser('resident')
    const admin = await createUser('admin')
    const complaint = await fileComplaint(resident.token)
    const remove = (token, body) => api().patch(`/api/complaints/${complaint._id}/remove`).set(auth(token)).send(body)

    assert.equal((await remove(resident.token, { reason: 'abusive' })).status, 403)
    assert.equal((await remove(admin.token, {})).status, 400)
    assert.equal((await remove(admin.token, { reason: 'I just do not like it' })).status, 400)
    // "Other" needs a message, so the resident still learns why
    assert.equal((await remove(admin.token, { reason: 'other', message: '  ' })).status, 400)

    const res = await remove(admin.token, { reason: 'abusive', message: 'Please keep it polite.' })
    assert.equal(res.status, 200)
    const entry = res.body.history.at(-1)
    assert.equal(entry.type, 'removed')
    assert.equal(entry.reason, 'abusive')
    assert.equal(entry.note, 'Please keep it polite.')

    assert.equal((await remove(admin.token, { reason: 'abusive' })).status, 400)
  })

  it('shows the resident why, hides it from the agent, and keeps it out of live counts', async () => {
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
      .send({ reason: 'abusive', message: 'Please keep it polite.' })

    const caseNumbers = (res) => res.body.items.map((item) => item.caseNumber).sort()

    // The resident still sees both, and can open the removed one to read why
    const residentList = await api().get('/api/complaints').set(auth(resident.token))
    assert.deepEqual(caseNumbers(residentList), [kept.caseNumber, rude.caseNumber].sort())
    assert.equal(residentList.body.items.find((item) => item.caseNumber === rude.caseNumber).removed, true)
    const residentOpen = await api().get('/api/complaints?status=open').set(auth(resident.token))
    assert.deepEqual(caseNumbers(residentOpen), [kept.caseNumber])
    const residentView = await api().get(`/api/complaints/${rude._id}`).set(auth(resident.token))
    assert.equal(residentView.status, 200)
    assert.equal(residentView.body.history.at(-1).reason, 'abusive')
    assert.equal(residentView.body.history.at(-1).note, 'Please keep it polite.')

    const residentStats = await api().get('/api/complaints/stats').set(auth(resident.token))
    assert.equal(residentStats.body.byStatus.open, 1)
    assert.equal(residentStats.body.removed, 1)
    assert.equal(residentStats.body.total, 2)

    // The agent and the admin's normal list only show live work
    for (const who of [agent, admin]) {
      const list = await api().get('/api/complaints').set(auth(who.token))
      assert.deepEqual(caseNumbers(list), [kept.caseNumber])
      const stats = await api().get('/api/complaints/stats').set(auth(who.token))
      assert.equal(stats.body.total, 1)
    }
    assert.equal((await api().get(`/api/complaints/${rude._id}`).set(auth(agent.token))).status, 410)
    const agentTry = await api().get('/api/complaints?removed=true').set(auth(agent.token))
    assert.deepEqual(caseNumbers(agentTry), [kept.caseNumber])

    const adminStats = await api().get('/api/complaints/stats').set(auth(admin.token))
    assert.equal(adminStats.body.removed, 1)
    const removedList = await api().get('/api/complaints?removed=true').set(auth(admin.token))
    assert.deepEqual(caseNumbers(removedList), [rude.caseNumber])

    const staff = await api().get('/api/users?role=agent').set(auth(admin.token))
    assert.equal(staff.body[0].activeComplaints, 1)
  })

  it('blocks every change once removed', async () => {
    const resident = await createUser('resident')
    const agent = await createUser('agent')
    const admin = await createUser('admin')
    const complaint = await fileComplaint(resident.token)
    await api().patch(`/api/complaints/${complaint._id}/remove`).set(auth(admin.token)).send({ reason: 'not_real' })
    const url = `/api/complaints/${complaint._id}`

    assert.equal((await api().patch(url).set(auth(resident.token)).send(validComplaint)).status, 400)
    assert.equal((await api().post(`${url}/comments`).set(auth(resident.token)).send({ text: 'Why?' })).status, 400)
    assert.equal((await api().post(`${url}/comments`).set(auth(admin.token)).send({ text: 'Note' })).status, 400)
    const assign = await api().patch(`${url}/assign`).set(auth(admin.token)).send({ agentId: agent.user._id })
    assert.equal(assign.status, 400)
    const close = await api().patch(`${url}/status`).set(auth(admin.token)).send({ status: 'closed', note: 'Done' })
    assert.equal(close.status, 400)
  })

  it('can be restored by an admin, with the status it had', async () => {
    const resident = await createUser('resident')
    const agent = await createUser('agent')
    const admin = await createUser('admin')
    const complaint = await fileComplaint(resident.token)
    const url = `/api/complaints/${complaint._id}`
    await api().patch(`${url}/assign`).set(auth(admin.token)).send({ agentId: agent.user._id })
    await api().patch(`${url}/status`).set(auth(agent.token)).send({ status: 'in_progress' })

    assert.equal((await api().patch(`${url}/restore`).set(auth(admin.token))).status, 400)
    await api().patch(`${url}/remove`).set(auth(admin.token)).send({ reason: 'duplicate' })
    assert.equal((await api().patch(`${url}/restore`).set(auth(resident.token))).status, 403)

    const restored = await api().patch(`${url}/restore`).set(auth(admin.token))
    assert.equal(restored.status, 200)
    assert.equal(restored.body.removed, false)
    assert.equal(restored.body.status, 'in_progress')
    assert.equal(restored.body.history.at(-1).type, 'restored')

    const agentList = await api().get('/api/complaints').set(auth(agent.token))
    assert.equal(agentList.body.total, 1)
    const resolve = await api().patch(`${url}/status`).set(auth(agent.token)).send({ status: 'resolved', note: 'Fixed' })
    assert.equal(resolve.status, 200)
  })
})
