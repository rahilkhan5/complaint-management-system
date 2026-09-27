// Shared lists used by models, controllers and validation.

export const ROLES = ['resident', 'agent', 'admin']

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

export const PRIORITIES = ['low', 'medium', 'high']

export const STATUSES = ['open', 'in_progress', 'resolved', 'closed']

// Why an admin removed a complaint. The resident reads the label, so keep it polite.
export const REMOVAL_REASONS = {
  abusive: 'Abusive language',
  incomplete: 'Incomplete information',
  duplicate: 'Duplicate complaint',
  not_real: 'Not a real complaint',
  other: 'Other',
}

// Which status can move to which, and who is allowed to make that move.
// "owner" means the resident who filed the complaint.
// "assignee" means the agent the complaint is assigned to.
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
