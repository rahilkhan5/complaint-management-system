// Fills the database with demo accounts and realistic complaints.
// Run: npm run seed   (WARNING: deletes all existing users and complaints first)
import 'dotenv/config'
import mongoose from 'mongoose'
import Complaint from '../src/models/Complaint.js'
import Counter from '../src/models/Counter.js'
import User from '../src/models/User.js'

const DEMO_PASSWORD = 'Demo@1234'
const DAY = 24 * 60 * 60 * 1000
const daysAgo = (days, hours = 0) => new Date(Date.now() - days * DAY - hours * 60 * 60 * 1000)

const users = [
  { key: 'admin', name: 'Sana Iqbal', email: 'admin@demo.com', role: 'admin', phone: '0300-1112233' },
  { key: 'agent1', name: 'Imran Qureshi', email: 'agent@demo.com', role: 'agent', phone: '0301-2223344' },
  { key: 'agent2', name: 'Farah Siddiqui', email: 'agent2@demo.com', role: 'agent', phone: '0302-3334455' },
  { key: 'resident1', name: 'Ahmed Raza', email: 'resident@demo.com', role: 'resident', phone: '0321-4445566', address: 'Block C, Street 4, House 27' },
  { key: 'resident2', name: 'Ayesha Khan', email: 'ayesha@demo.com', role: 'resident', phone: '0322-5556677', address: 'Block A, Street 11, House 105' },
  { key: 'resident3', name: 'Bilal Hussain', email: 'bilal@demo.com', role: 'resident', phone: '0323-6667788', address: 'Block F, Apartment 3-B' },
]

// status flow for each complaint is written as steps so the history looks real
const complaints = [
  {
    by: 'resident1', title: 'No water supply since yesterday morning',
    description: 'Our house has had no water since 7 am yesterday. Neighbours on the same street have water, so it may be a problem with our connection or valve.',
    category: 'Water Supply', priority: 'high', location: 'Block C, Street 4, House 27', created: daysAgo(1, 3),
    steps: [{ assign: 'agent1', at: daysAgo(1, 1) }, { status: 'in_progress', who: 'agent1', note: 'Plumbing team is checking the main valve on Street 4.', at: daysAgo(0, 20) }],
    comments: [{ who: 'resident1', text: 'Still no water this morning. We have elderly parents at home, please treat this as urgent.', at: daysAgo(0, 18) }, { who: 'agent1', text: 'Understood. A water tanker has been arranged for today while the valve is repaired.', at: daysAgo(0, 17) }],
  },
  {
    by: 'resident1', title: 'Street light not working near park gate',
    description: 'The street light next to the main gate of the Block C park has been off for four nights. The area is completely dark after maghrib.',
    category: 'Electricity', priority: 'medium', location: 'Block C, park main gate', created: daysAgo(6),
    steps: [{ assign: 'agent2', at: daysAgo(5, 20) }, { status: 'in_progress', who: 'agent2', at: daysAgo(5) }, { status: 'resolved', who: 'agent2', note: 'Replaced the faulty bulb and the photocell sensor.', at: daysAgo(3) }],
    comments: [],
  },
  {
    by: 'resident1', title: 'Garbage not collected for three days',
    description: 'The garbage bin outside our street has not been emptied since Monday. It is overflowing and smells bad.',
    category: 'Sanitation', priority: 'medium', location: 'Block C, Street 4', created: daysAgo(12),
    steps: [{ assign: 'agent1', at: daysAgo(12) }, { status: 'in_progress', who: 'agent1', at: daysAgo(11, 20) }, { status: 'resolved', who: 'agent1', note: 'Collection truck rerouted. Bin emptied and cleaned.', at: daysAgo(11) }, { status: 'closed', who: 'resident1', at: daysAgo(10) }],
    comments: [{ who: 'resident1', text: 'Thank you, the street is clean now.', at: daysAgo(10) }],
  },
  {
    by: 'resident2', title: 'Water leaking from underground pipe',
    description: 'Clean water is leaking onto the road in front of House 105 from what looks like a broken underground pipe. A lot of water is being wasted.',
    category: 'Plumbing', priority: 'high', location: 'Block A, Street 11, House 105', created: daysAgo(0, 5),
    steps: [], comments: [],
  },
  {
    by: 'resident2', title: 'Security guard absent at night at Gate 2',
    description: 'For the last two nights there was no guard at Gate 2 between 1 am and 4 am. Anyone could enter without checking.',
    category: 'Security', priority: 'high', location: 'Block A, Gate 2', created: daysAgo(2),
    steps: [{ assign: 'agent2', at: daysAgo(1, 22) }, { status: 'in_progress', who: 'agent2', note: 'Security supervisor informed. Night shift roster is being checked.', at: daysAgo(1, 10) }],
    comments: [],
  },
  {
    by: 'resident2', title: 'Deep pothole on main boulevard',
    description: 'There is a deep pothole on the main boulevard near the roundabout. Two motorcycles have already slipped there this week.',
    category: 'Roads & Streets', priority: 'medium', location: 'Main boulevard, near roundabout', created: daysAgo(4),
    steps: [{ assign: 'agent1', at: daysAgo(3, 20) }],
    comments: [],
  },
  {
    by: 'resident3', title: 'Frequent power trips in apartment',
    description: 'The electricity trips three to four times every evening in our apartment. Other flats on the floor have the same issue. We think the building supply is overloaded.',
    category: 'Electricity', priority: 'high', location: 'Block F, Apartment 3-B', created: daysAgo(3),
    steps: [{ assign: 'agent2', at: daysAgo(2, 20) }, { status: 'in_progress', who: 'agent2', at: daysAgo(2) }, { status: 'resolved', who: 'agent2', note: 'Distribution board breaker replaced for the whole floor.', at: daysAgo(1) }, { status: 'in_progress', who: 'resident3', note: 'Power tripped again last night at 9 pm.', at: daysAgo(0, 12) }],
    comments: [{ who: 'agent2', text: 'Sorry about this. An electrician will check the building load today.', at: daysAgo(0, 10) }],
  },
  {
    by: 'resident3', title: 'Broken swing in children park',
    description: 'One of the swings in the Block F children park has a broken chain. It is dangerous for kids.',
    category: 'Parks & Common Areas', priority: 'low', location: 'Block F, children park', created: daysAgo(8),
    steps: [{ assign: 'agent1', at: daysAgo(8) }, { status: 'in_progress', who: 'agent1', at: daysAgo(7) }, { status: 'resolved', who: 'agent1', note: 'Chain replaced and all swings inspected.', at: daysAgo(6) }, { status: 'closed', who: 'resident3', at: daysAgo(5) }],
    comments: [],
  },
  {
    by: 'resident3', title: 'Sewer line blocked in basement parking',
    description: 'Sewer water is coming up from the drain in the basement parking of Block F. The smell is spreading to the ground floor.',
    category: 'Sanitation', priority: 'high', location: 'Block F, basement parking', created: daysAgo(0, 2),
    steps: [], comments: [],
  },
  {
    by: 'resident1', title: 'Stray dogs near school pick-up point',
    description: 'A group of stray dogs gathers near the school pick-up point every morning. Children are scared to walk past.',
    category: 'Other', priority: 'medium', location: 'Block C, school pick-up point', created: daysAgo(9),
    steps: [{ status: 'closed', who: 'admin', note: 'Duplicate of an existing complaint handled by the municipal team.', at: daysAgo(8) }],
    comments: [],
  },
]

async function seed() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing in server/.env')
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })

  await Promise.all([User.deleteMany({}), Complaint.deleteMany({}), Counter.deleteMany({})])

  const byKey = {}
  for (const u of users) {
    const { key, ...data } = u
    byKey[key] = await User.create({ ...data, password: DEMO_PASSWORD })
  }

  // Oldest first, so case numbers go up with time
  const ordered = [...complaints].sort((a, b) => a.created - b.created)

  for (const c of ordered) {
    const complaint = new Complaint({
      title: c.title,
      description: c.description,
      category: c.category,
      priority: c.priority,
      location: c.location,
      createdBy: byKey[c.by]._id,
      history: [{ type: 'created', status: 'open', by: byKey[c.by]._id, createdAt: c.created }],
      createdAt: c.created,
    })

    for (const step of c.steps) {
      if (step.assign) {
        complaint.assignedTo = byKey[step.assign]._id
        complaint.history.push({ type: 'assigned', assignedTo: byKey[step.assign]._id, by: byKey.admin._id, createdAt: step.at })
      } else {
        complaint.status = step.status
        if (step.status === 'resolved') complaint.resolvedAt = step.at
        if (step.status === 'closed') complaint.closedAt = step.at
        if (step.status === 'in_progress' && complaint.resolvedAt) complaint.resolvedAt = undefined
        complaint.history.push({ type: 'status', status: step.status, note: step.note, by: byKey[step.who]._id, createdAt: step.at })
      }
    }

    for (const comment of c.comments) {
      complaint.comments.push({ author: byKey[comment.who]._id, text: comment.text, createdAt: comment.at })
    }

    const eventTimes = [c.created, ...c.steps.map((s) => s.at), ...c.comments.map((m) => m.at)]
    complaint.updatedAt = new Date(Math.max(...eventTimes.map((d) => d.getTime())))

    // Save once so the case number is generated, keeping our own dates
    await complaint.save({ timestamps: false })
  }

  console.log(`Seeded ${users.length} users and ${complaints.length} complaints.`)
  console.log(`Demo password for every account: ${DEMO_PASSWORD}`)
  await mongoose.disconnect()
}

seed().catch(async (error) => {
  console.error(error)
  await mongoose.disconnect()
  process.exit(1)
})
