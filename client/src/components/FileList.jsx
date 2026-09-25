import { Link } from 'react-router'
import { formatDate } from '../utils/format.js'
import PriorityTag from './PriorityTag.jsx'
import StatusSticker from './StatusSticker.jsx'

// The small line under the date changes with the role: each role cares about a different person
function whoLine(complaint, role) {
  if (role === 'agent') return `Filed by ${complaint.createdBy?.name ?? 'a resident'}`
  if (complaint.assignedTo) return `Agent: ${complaint.assignedTo.name}`
  if (['resolved', 'closed'].includes(complaint.status)) return 'No agent'
  return role === 'resident' ? 'Waiting for an agent' : 'Not assigned'
}

export default function FileList({ complaints, role }) {
  return (
    <div>
      <div className="file-list__head" aria-hidden="true">
        <span>Complaint</span>
        <span>Category</span>
        <span>Status</span>
        <span>Filed</span>
      </div>
      <ul className="file-list">
        {complaints.map((complaint) => (
          <li key={complaint._id} className="file" data-status={complaint.status}>
            <Link to={`/complaints/${complaint._id}`} className="file__link">
              <span className="file__tab">
                <span className="file__tab-dot" aria-hidden="true" />
                {complaint.caseNumber}
              </span>
              <div className="file__body">
                <div className="file__main">
                  <h3 className="file__title">{complaint.title}</h3>
                  <p className="file__meta">
                    {complaint.location}
                    <span className="file__meta-category"> · {complaint.category}</span>
                  </p>
                  {complaint.priority === 'high' && <PriorityTag priority="high" />}
                </div>
                <div className="file__cell file__cell--category">{complaint.category}</div>
                <div className="file__foot">
                  <div className="file__cell">
                    <StatusSticker status={complaint.status} />
                  </div>
                  <div className="file__cell">
                    <span className="file__when">{formatDate(complaint.createdAt)}</span>
                    <span className="file__who">{whoLine(complaint, role)}</span>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
