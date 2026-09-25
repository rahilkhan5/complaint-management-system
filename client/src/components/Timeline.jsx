import {
  Archive,
  Ban,
  CheckCircle2,
  EyeOff,
  FilePlus2,
  MessageSquare,
  MessageSquareOff,
  Pencil,
  RotateCcw,
  UserRoundCheck,
  Wrench,
} from 'lucide-react'
import { useState } from 'react'
import { ROLE_LABELS } from '../constants.js'
import { formatDateTime } from '../utils/format.js'

// Puts status changes, assignments and comments into one list, oldest first
function buildEvents(complaint) {
  const events = []
  let previousStatus = null

  for (const entry of complaint.history) {
    events.push({ id: entry._id, kind: entry.type, entry, from: previousStatus, at: entry.createdAt })
    // Only "created" and "status" entries carry a status
    if (entry.status) previousStatus = entry.status
  }
  for (const comment of complaint.comments) {
    events.push({ id: comment._id, kind: 'comment', entry: comment, at: comment.createdAt })
  }

  return events.sort((a, b) => new Date(a.at) - new Date(b.at))
}

// ["title", "location"] becomes "the title and location"
function listFields(fields = []) {
  if (fields.length === 0) return 'the details'
  if (fields.length === 1) return `the ${fields[0]}`
  return `the ${fields.slice(0, -1).join(', ')} and ${fields.at(-1)}`
}

// Icon, status color and sentence for one event
function describe(event) {
  const { entry } = event
  const who = <strong>{entry.by?.name ?? 'Someone'}</strong>

  if (event.kind === 'created') {
    return { Icon: FilePlus2, status: 'open', text: <>{who} filed this complaint</> }
  }
  if (event.kind === 'edited') {
    return { Icon: Pencil, text: <>{who} edited {listFields(entry.fields)}</> }
  }
  if (event.kind === 'removed') {
    return { Icon: Ban, status: 'removed', text: <>{who} removed this complaint</> }
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

// One comment. Admins get a Remove button (onRemove is only passed for them).
function CommentItem({ comment, at, onRemove }) {
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const { author, text, removed } = comment

  async function remove() {
    setBusy(true)
    setError('')
    try {
      await onRemove(comment._id)
      setConfirming(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className={`timeline__item timeline__item--comment${removed ? ' is-removed' : ''}`}>
      <span className="timeline__icon" aria-hidden="true">
        {removed ? <MessageSquareOff size={16} /> : <MessageSquare size={16} />}
      </span>
      <div className="timeline__content">
        <p className="timeline__line">
          <strong>{author?.name ?? 'Someone'}</strong>
          {author?.role && <span className="role-chip">{ROLE_LABELS[author.role]}</span>}{' '}
          <time className="timeline__time" dateTime={at}>
            · {formatDateTime(at)}
          </time>
        </p>

        {removed ? (
          <div className="timeline__note timeline__note--removed">
            <p className="timeline__removed-text">This comment was removed by an admin.</p>
            {/* The server only sends the original text to admins */}
            {text && (
              <>
                <p className="timeline__removed-meta">
                  Removed by {comment.removedBy?.name ?? 'an admin'} on {formatDateTime(comment.removedAt)}. Only
                  admins can see what it said:
                </p>
                <p className="timeline__original">{text}</p>
              </>
            )}
          </div>
        ) : (
          <p className="timeline__note">{text}</p>
        )}

        {onRemove && !removed && !confirming && (
          <button type="button" className="btn btn--ghost btn--sm comment-tool" onClick={() => setConfirming(true)}>
            <EyeOff size={14} aria-hidden="true" />
            Remove comment
          </button>
        )}
        {onRemove && !removed && confirming && (
          <div className="comment-confirm" role="group" aria-label="Remove this comment">
            <p className="comment-confirm__text">
              Remove this comment? Everyone else will only see that it was removed.
            </p>
            <div className="comment-confirm__buttons">
              <button type="button" className="btn btn--ghost btn--sm" disabled={busy} onClick={() => setConfirming(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn--danger btn--sm" disabled={busy} onClick={remove} autoFocus>
                {busy && <span className="spinner" aria-hidden="true" />}
                Remove
              </button>
            </div>
          </div>
        )}
        {error && (
          <p className="field__error" role="alert">
            {error}
          </p>
        )}
      </div>
    </li>
  )
}

export default function Timeline({ complaint, onRemoveComment }) {
  const events = buildEvents(complaint)

  return (
    <ol className="timeline">
      {events.map((event) => {
        if (event.kind === 'comment') {
          return <CommentItem key={event.id} comment={event.entry} at={event.at} onRemove={onRemoveComment} />
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
