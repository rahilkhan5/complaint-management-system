import { Archive, CheckCircle2, FilePlus2, MessageSquare, RotateCcw, UserRoundCheck, Wrench } from 'lucide-react'
import { ROLE_LABELS } from '../constants.js'
import { formatDateTime } from '../utils/format.js'

// Puts status changes, assignments and comments into one list, oldest first
function buildEvents(complaint) {
  const events = []
  let previousStatus = null

  for (const entry of complaint.history) {
    events.push({ id: entry._id, kind: entry.type, entry, from: previousStatus, at: entry.createdAt })
    if (entry.type !== 'assigned') previousStatus = entry.status
  }
  for (const comment of complaint.comments) {
    events.push({ id: comment._id, kind: 'comment', entry: comment, at: comment.createdAt })
  }

  return events.sort((a, b) => new Date(a.at) - new Date(b.at))
}

// Icon, status color and sentence for one event
function describe(event) {
  const { entry } = event
  const who = <strong>{entry.by?.name ?? 'Someone'}</strong>

  if (event.kind === 'created') {
    return { Icon: FilePlus2, status: 'open', text: <>{who} filed this complaint</> }
  }
  if (event.kind === 'assigned') {
    return {
      Icon: UserRoundCheck,
      text: (
        <>
          {who} assigned it to <strong>{entry.assignedTo?.name ?? 'an agent'}</strong>
        </>
      ),
    }
  }
  if (entry.status === 'in_progress' && event.from === 'resolved') {
    return { Icon: RotateCcw, status: 'in_progress', text: <>{who} reopened it</> }
  }
  if (entry.status === 'in_progress') {
    return { Icon: Wrench, status: 'in_progress', text: <>{who} started work</> }
  }
  if (entry.status === 'resolved') {
    return { Icon: CheckCircle2, status: 'resolved', text: <>{who} marked it resolved</> }
  }
  return { Icon: Archive, status: 'closed', text: <>{who} closed it</> }
}

export default function Timeline({ complaint }) {
  const events = buildEvents(complaint)

  return (
    <ol className="timeline">
      {events.map((event) => {
        if (event.kind === 'comment') {
          const { author, text } = event.entry
          return (
            <li key={event.id} className="timeline__item timeline__item--comment">
              <span className="timeline__icon" aria-hidden="true">
                <MessageSquare size={16} />
              </span>
              <div className="timeline__content">
                <p className="timeline__line">
                  <strong>{author?.name ?? 'Someone'}</strong>
                  {author?.role && <span className="role-chip">{ROLE_LABELS[author.role]}</span>}
                  {' '}
                  <time className="timeline__time" dateTime={event.at}>
                    · {formatDateTime(event.at)}
                  </time>
                </p>
                <p className="timeline__note">{text}</p>
              </div>
            </li>
          )
        }

        const { Icon, status, text } = describe(event)
        return (
          <li key={event.id} className="timeline__item" data-status={status}>
            <span className="timeline__icon" aria-hidden="true">
              <Icon size={16} />
            </span>
            <div className="timeline__content">
              <p className="timeline__line">
                {text}{' '}
                <time className="timeline__time" dateTime={event.at}>
                  · {formatDateTime(event.at)}
                </time>
              </p>
              {event.entry.note && <p className="timeline__note">{event.entry.note}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
