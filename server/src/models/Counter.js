import mongoose from 'mongoose'

// Keeps a running number so every complaint gets a readable case number (CMS-0001, CMS-0002...)
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
})

const Counter = mongoose.model('Counter', counterSchema)

export async function nextSequence(name) {
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true },
  )
  return counter.seq
}

export default Counter
