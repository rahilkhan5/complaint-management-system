import mongoose from 'mongoose'
import { ROLES } from '../constants.js'
import Complaint from '../models/Complaint.js'
import User from '../models/User.js'
import { httpError } from '../utils/httpError.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// GET /api/users?role=agent&active=true  (admins)
export async function listUsers(req, res) {
  const filter = {}
  if (ROLES.includes(req.query.role)) filter.role = req.query.role
  if (req.query.active === 'true') filter.isActive = true

  const users = await User.find(filter).sort({ role: 1, name: 1 })

  // How many unfinished complaints each agent is holding right now
  const workload = await Complaint.aggregate([
    { $match: { assignedTo: { $ne: null }, status: { $in: ['open', 'in_progress'] }, removed: { $ne: true } } },
    { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
  ])
  const workloadById = Object.fromEntries(workload.map((row) => [row._id.toString(), row.count]))

  res.json(
    users.map((user) => ({
      ...user.toJSON(),
      activeComplaints: workloadById[user._id.toString()] || 0,
    })),
  )
}

// POST /api/users  (admins create staff accounts)
export async function createStaff(req, res) {
  const { name, email, password, phone, role } = req.body

  if (!name?.trim() || !email?.trim() || !password) {
    throw httpError(400, 'Name, email and password are required')
  }
  if (!['agent', 'admin'].includes(role)) throw httpError(400, 'Role must be agent or admin')
  if (!EMAIL_PATTERN.test(email)) throw httpError(400, 'Please enter a valid email address')
  if (password.length < 8) throw httpError(400, 'Password must be at least 8 characters')

  const exists = await User.exists({ email: email.toLowerCase().trim() })
  if (exists) throw httpError(409, 'An account with this email already exists')

  const user = await User.create({ name, email, password, phone, role })
  res.status(201).json({ ...user.toJSON(), activeComplaints: 0 })
}

// PATCH /api/users/:id  (admins activate or deactivate an account)
export async function updateUser(req, res) {
  const { isActive } = req.body
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, 'User not found')
  if (typeof isActive !== 'boolean') throw httpError(400, 'isActive must be true or false')
  if (req.params.id === req.user._id.toString()) {
    throw httpError(400, 'You cannot deactivate your own account')
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { returnDocument: 'after', runValidators: true },
  )
  if (!user) throw httpError(404, 'User not found')

  res.json(user)
}
