// Labels shown in the UI for the values stored in the database

export const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

export const STATUSES = Object.keys(STATUS_LABELS)

export const CATEGORIES = [
  'Electricity',
  'Water Supply',
  'Plumbing',
  'Sanitation',
  'Security',
  'Roads & Streets',
  'Parks & Common Areas',
  'Other',
]

export const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const ROLE_LABELS = {
  resident: 'Resident',
  agent: 'Support agent',
  admin: 'Admin',
}

// Same rules as server/src/constants.js: which status can move to which, and who may do it.
// The server always checks again; this copy only decides which buttons to show.
export const TRANSITIONS = {
  open: {
    in_progress: ['assignee', 'admin'],
    closed: ['admin'],
  },
  in_progress: {
    resolved: ['assignee', 'admin'],
  },
  resolved: {
    closed: ['owner', 'admin'],
    in_progress: ['owner', 'admin'],
  },
  closed: {},
}

// Button text and note rules for each status change, keyed "from>to"
export const STATUS_ACTIONS = {
  'open>in_progress': { label: 'Start work', needsNote: false },
  'open>closed': {
    label: 'Close without action',
    needsNote: true,
    notePrompt: 'Why is this complaint being closed?',
    tone: 'secondary',
  },
  'in_progress>resolved': {
    label: 'Mark as resolved',
    needsNote: true,
    notePrompt: 'What was done to fix it?',
  },
  'resolved>closed': { label: 'Confirm fix and close', needsNote: false },
  'resolved>in_progress': {
    label: 'Not fixed, reopen',
    needsNote: true,
    notePrompt: 'What is still wrong?',
    tone: 'secondary',
  },
}

// Demo accounts created by `npm run seed`, shown on the login page
export const DEMO_ACCOUNTS = [
  { role: 'resident', email: 'resident@demo.com', label: 'Resident', hint: 'Files and tracks complaints' },
  { role: 'agent', email: 'agent@demo.com', label: 'Support agent', hint: 'Works on assigned complaints' },
  { role: 'admin', email: 'admin@demo.com', label: 'Admin', hint: 'Assigns work and manages staff' },
]

export const DEMO_PASSWORD = 'Demo@1234'
