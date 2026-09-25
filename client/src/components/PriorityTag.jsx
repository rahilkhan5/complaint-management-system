import { TriangleAlert } from 'lucide-react'
import { PRIORITY_LABELS } from '../constants.js'

export default function PriorityTag({ priority }) {
  return (
    <span className={`priority priority--${priority}`}>
      {priority === 'high' && <TriangleAlert size={14} strokeWidth={2} aria-hidden="true" />}
      {PRIORITY_LABELS[priority]} priority
    </span>
  )
}
