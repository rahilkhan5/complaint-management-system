import mongoose from 'mongoose'
import { CATEGORIES, PRIORITIES, STATUSES } from '../constants.js'
import { nextSequence } from './Counter.js'

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

// One entry for every important event, so the complaint keeps its full history
const historySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['created', 'status', 'assigned'], required: true },
    status: { type: String, enum: STATUSES },
    note: { type: String, trim: true, maxlength: 500 },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

const complaintSchema = new mongoose.Schema(
  {
    caseNumber: { type: String, unique: true },
    title: { type: String, required: true, trim: true, minlength: 5, maxlength: 100 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
    category: { type: String, enum: CATEGORIES, required: true },
    priority: { type: String, enum: PRIORITIES, default: 'medium' },
    status: { type: String, enum: STATUSES, default: 'open' },
    location: { type: String, required: true, trim: true, maxlength: 120 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    comments: [commentSchema],
    history: [historySchema],
    resolvedAt: Date,
    closedAt: Date,
  },
  { timestamps: true },
)

// Give each new complaint the next case number before it is saved
complaintSchema.pre('save', async function () {
  if (this.caseNumber) return
  const seq = await nextSequence('complaint')
  this.caseNumber = `CMS-${String(seq).padStart(4, '0')}`
})

complaintSchema.index({ status: 1, createdAt: -1 })
complaintSchema.index({ createdBy: 1, createdAt: -1 })
complaintSchema.index({ assignedTo: 1, status: 1 })

export default mongoose.model('Complaint', complaintSchema)
