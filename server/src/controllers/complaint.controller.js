import mongoose from 'mongoose'
import { CATEGORIES, PRIORITIES, STATUSES, TRANSITIONS } from '../constants.js'
import Complaint from '../models/Complaint.js'
import User from '../models/User.js'
import { httpError } from '../utils/httpError.js'

const DAY = 24 * 60 * 60 * 1000

// Residents only see what they filed, agents only what is assigned to them, admins see everything
function scopeFor(user) {
  if (user.role === 'resident') return { createdBy: user._id }
  if (user.role === 'agent') return { assignedTo: user._id }
  return {}
}

// Compares two ids whether they are plain ObjectIds or populated documents
function sameId(a, b) {
  if (!a || !b) return false
  return String(a._id ?? a) === String(b._id ?? b)
}

// Which "hats" the user wears for this complaint: owner, assignee and/or admin
function actorRoles(user, complaint) {
  const roles = []
  if (user.role === 'admin') roles.push('admin')
  if (sameId(complaint.createdBy, user)) roles.push('owner')
  if (sameId(complaint.assignedTo, user)) roles.push('assignee')
  return roles
}

function canView(user, complaint) {
  return actorRoles(user, complaint).length > 0
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function findComplaintOr404(id) {
  if (!mongoose.isValidObjectId(id)) throw httpError(404, 'Complaint not found')
  const complaint = await Complaint.findById(id)
  if (!complaint) throw httpError(404, 'Complaint not found')
  return complaint
}

async function populateFull(complaint) {
  return complaint.populate([
    { path: 'createdBy', select: 'name email phone address' },
    { path: 'assignedTo', select: 'name email phone' },
    { path: 'comments.author', select: 'name role' },
    { path: 'history.by', select: 'name role' },
    { path: 'history.assignedTo', select: 'name' },
  ])
}

// GET /api/complaints
export async function listComplaints(req, res) {
  const { status, category, priority, q, unassigned } = req.query
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)
  const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 20))

  const filter = scopeFor(req.user)
  if (status && STATUSES.includes(status)) filter.status = status
  if (category && CATEGORIES.includes(category)) filter.category = category
  if (priority && PRIORITIES.includes(priority)) filter.priority = priority
  if (unassigned === 'true' && req.user.role === 'admin') filter.assignedTo = null
  if (q?.trim()) {
    const pattern = new RegExp(escapeRegex(q.trim()), 'i')
    filter.$or = [{ title: pattern }, { caseNumber: pattern }, { location: pattern }]
  }

  const [items, total] = await Promise.all([
    Complaint.find(filter)
      .select('-comments -history')
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Complaint.countDocuments(filter),
  ])

  res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) })
}

// GET /api/complaints/stats
export async function getStats(req, res) {
  const scope = scopeFor(req.user)
  const now = Date.now()
  const weekAgo = new Date(now - 7 * DAY)
  const twoWeeksAgo = new Date(now - 14 * DAY)

  const [statusCounts, newThisWeek, newLastWeek, resolvedThisWeek, resolvedLastWeek] =
    await Promise.all([
      Complaint.aggregate([{ $match: scope }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Complaint.countDocuments({ ...scope, createdAt: { $gte: weekAgo } }),
      Complaint.countDocuments({ ...scope, createdAt: { $gte: twoWeeksAgo, $lt: weekAgo } }),
      Complaint.countDocuments({ ...scope, resolvedAt: { $gte: weekAgo } }),
      Complaint.countDocuments({ ...scope, resolvedAt: { $gte: twoWeeksAgo, $lt: weekAgo } }),
    ])

  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0]))
  for (const row of statusCounts) byStatus[row._id] = row.count

  const stats = {
    byStatus,
    total: Object.values(byStatus).reduce((sum, n) => sum + n, 0),
    newThisWeek,
    newLastWeek,
    resolvedThisWeek,
    resolvedLastWeek,
  }

  if (req.user.role === 'admin') {
    const [unassigned, byCategory] = await Promise.all([
      Complaint.countDocuments({ assignedTo: null, status: { $in: ['open', 'in_progress'] } }),
      Complaint.aggregate([
        { $match: { status: { $in: ['open', 'in_progress'] } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ])
    stats.unassigned = unassigned
    stats.byCategory = byCategory.map((row) => ({ category: row._id, count: row.count }))
  }

  res.json(stats)
}

// POST /api/complaints  (residents)
export async function createComplaint(req, res) {
  const { title, description, category, priority, location } = req.body

  if (!title?.trim() || !description?.trim() || !category || !location?.trim()) {
    throw httpError(400, 'Title, description, category and location are required')
  }
  if (!CATEGORIES.includes(category)) throw httpError(400, 'Please choose a valid category')
  if (priority && !PRIORITIES.includes(priority)) throw httpError(400, 'Please choose a valid priority')

  const complaint = new Complaint({
    title,
    description,
    category,
    priority: priority || 'medium',
    location,
    createdBy: req.user._id,
    history: [{ type: 'created', status: 'open', by: req.user._id }],
  })

  try {
    await complaint.save()
  } catch (error) {
    if (error.name === 'ValidationError') {
      throw httpError(400, Object.values(error.errors)[0].message)
    }
    throw error
  }

  res.status(201).json(await populateFull(complaint))
}

// GET /api/complaints/:id
export async function getComplaint(req, res) {
  const complaint = await findComplaintOr404(req.params.id)
  // 404 instead of 403 so users cannot find out which complaint numbers exist
  if (!canView(req.user, complaint)) throw httpError(404, 'Complaint not found')
  res.json(await populateFull(complaint))
}

// PATCH /api/complaints/:id/status
export async function updateStatus(req, res) {
  const { status, note } = req.body
  const complaint = await findComplaintOr404(req.params.id)
  const roles = actorRoles(req.user, complaint)
  if (roles.length === 0) throw httpError(404, 'Complaint not found')

  const allowed = TRANSITIONS[complaint.status]?.[status]
  if (!allowed) {
    throw httpError(400, `A ${complaint.status.replace('_', ' ')} complaint cannot be moved to ${String(status).replace('_', ' ')}`)
  }
  if (!allowed.some((role) => roles.includes(role))) {
    throw httpError(403, 'You are not allowed to make this change')
  }

  const trimmedNote = note?.trim()
  const reopening = complaint.status === 'resolved' && status === 'in_progress'
  const closingEarly = complaint.status === 'open' && status === 'closed'
  if ((status === 'resolved' || reopening || closingEarly) && !trimmedNote) {
    throw httpError(400, 'Please add a short note explaining this change')
  }

  complaint.status = status
  if (status === 'resolved') complaint.resolvedAt = new Date()
  if (status === 'closed') complaint.closedAt = new Date()
  if (reopening) complaint.resolvedAt = undefined
  complaint.history.push({ type: 'status', status, note: trimmedNote, by: req.user._id })

  await complaint.save()
  res.json(await populateFull(complaint))
}

// PATCH /api/complaints/:id/assign  (admins)
export async function assignComplaint(req, res) {
  const { agentId } = req.body
  const complaint = await findComplaintOr404(req.params.id)

  if (complaint.status === 'closed' || complaint.status === 'resolved') {
    throw httpError(400, 'Only open or in progress complaints can be assigned')
  }
  if (!mongoose.isValidObjectId(agentId)) throw httpError(400, 'Please choose an agent')

  const agent = await User.findOne({ _id: agentId, role: 'agent', isActive: true })
  if (!agent) throw httpError(400, 'That agent was not found or is inactive')

  complaint.assignedTo = agent._id
  complaint.history.push({ type: 'assigned', assignedTo: agent._id, by: req.user._id })

  await complaint.save()
  res.json(await populateFull(complaint))
}

// POST /api/complaints/:id/comments
export async function addComment(req, res) {
  const text = req.body.text?.trim()
  const complaint = await findComplaintOr404(req.params.id)
  if (!canView(req.user, complaint)) throw httpError(404, 'Complaint not found')

  if (!text) throw httpError(400, 'Please write a comment first')
  if (text.length > 1000) throw httpError(400, 'Comments can be at most 1000 characters')
  if (complaint.status === 'closed') throw httpError(400, 'This complaint is closed')

  complaint.comments.push({ author: req.user._id, text })
  await complaint.save()
  res.status(201).json(await populateFull(complaint))
}
