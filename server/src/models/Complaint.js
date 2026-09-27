import mongoose from 'mongoose'
import { CATEGORIES, PRIORITIES, REMOVAL_REASONS, STATUSES } from '../constants.js'
import { nextSequence } from './Counter.js'

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
    // An admin can hide a rude comment. The text stays here for the record, but only admins get to see it.
    removed: { type: Boolean, default: false },
    removedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    removedAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

// One entry for every important event, so the complaint keeps its full history
const historySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['created', 'status', 'assigned', 'edited', 'removed', 'restored'], required: true },
    status: { type: String, enum: STATUSES },
    note: { type: String, trim: true, maxlength: 500 },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Which fields the resident changed, for "edited" entries
    fields: { type: [String], default: undefined },
    // Why the complaint was removed, for "removed" entries. The note holds the message to the resident.
    reason: { type: String, enum: Object.keys(REMOVAL_REASONS) },
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
    // Removed by an admin (rude or useless). The resident can still read it and see why, the agent cannot.
    // The reason is in the "removed" history entry. An admin can restore it.
    removed: { type: Boolean, default: false },
    removedAt: Date,
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
