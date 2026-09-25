import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { ROLES } from '../constants.js'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // select: false keeps the password hash out of every query unless we ask for it
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ROLES, default: 'resident' },
    phone: { type: String, trim: true, maxlength: 20 },
    // Residents only: where they live, e.g. "Block C, Street 4, House 27"
    address: { type: String, trim: true, maxlength: 120 },
    isActive: { type: Boolean, default: true },
    // Goes up by one on every password change. Tokens carry this number,
    // so tokens made before the change stop working (see middleware/auth.js)
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true },
)

// Hash the password before saving, but only when it was changed
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password)
}

// Never send the hash to the client, even if it was selected
userSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.password
    delete ret.tokenVersion
    delete ret.__v
    return ret
  },
})

export default mongoose.model('User', userSchema)
