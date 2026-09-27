import { ArrowLeft, Ban, FileQuestion, Pencil, Plus, Send, Undo2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { complaintsApi, usersApi } from '../api/services.js'
import Alert from '../components/Alert.jsx'
import EmptyState from '../components/EmptyState.jsx'
import PriorityTag from '../components/PriorityTag.jsx'
import RemovalNotice from '../components/RemovalNotice.jsx'
import RemoveComplaintPanel from '../components/RemoveComplaintPanel.jsx'
import { Skeleton } from '../components/Skeleton.jsx'
import StatusSticker from '../components/StatusSticker.jsx'
import Timeline from '../components/Timeline.jsx'
import { STATUS_ACTIONS, STATUS_LABELS, TRANSITIONS } from '../constants.js'
import { useAuth } from '../context/useAuth.js'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { formatDateTime, timeAgo } from '../utils/format.js'

const COMMENT_MAX = 1000

// Which "hats" the user wears for this complaint, same idea as the server's actorRoles()
function rolesFor(user, complaint) {
  const roles = []
  if (user.role === 'admin') roles.push('admin')
  if (complaint.createdBy?._id === user._id) roles.push('owner')
  if (complaint.assignedTo?._id === user._id) roles.push('assignee')
  return roles
}

// The status changes this user may make right now
function availableActions(user, complaint) {
  const roles = rolesFor(user, complaint)
  return Object.entries(TRANSITIONS[complaint.status])
    .filter(([, allowed]) => allowed.some((role) => roles.includes(role)))
    // Work can only start once an agent is assigned
    .filter(([to]) => !(complaint.status === 'open' && to === 'in_progress' && !complaint.assignedTo))
    .map(([to]) => ({ to, ...STATUS_ACTIONS[`${complaint.status}>${to}`] }))
}

// Who removed the complaint, when and why: the last "removed" entry in the history
function removalOf(complaint) {
  return complaint.removed ? complaint.history.findLast((entry) => entry.type === 'removed') : null
}

// What to tell the user when there is nothing for them to do
function waitingText(user, complaint) {
  const agent = complaint.assignedTo?.name
  switch (complaint.status) {
    case 'open':
      return agent ? `${agent} will start work on this soon.` : 'The office will assign an agent soon.'
    case 'in_progress':
      return user.role === 'resident'
        ? `${agent ?? 'An agent'} is working on this. You will be asked to confirm once it is fixed.`
        : 'Work is in progress.'
    case 'resolved':
      return 'Waiting for the resident to confirm the fix.'
    default:
      return `This complaint was closed on ${formatDateTime(complaint.closedAt)}.`
  }
}

export default function ComplaintDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // The loaded complaint remembers its id, so opening another complaint shows the loading state again
  const [loaded, setLoaded] = useState({ id: null, complaint: null, error: null })
  const complaint = loaded.id === id ? loaded.complaint : null
  const loadError = loaded.id === id ? loaded.error : null
  const setComplaint = (updated) => setLoaded({ id, complaint: updated, error: null })
  const [agents, setAgents] = useState([])
  // A one time message after filing or editing, passed along by the page that sent the user here
  const [notice] = useState(location.state?.justFiled ? 'filed' : location.state?.justEdited ? 'edited' : null)

  // Status change form
  const [pending, setPending] = useState(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [actionDone, setActionDone] = useState('')

  // Assign form (admins)
  const [agentId, setAgentId] = useState('')

  // Comment form
  const [comment, setComment] = useState('')
  const [commentError, setCommentError] = useState('')
  const [posting, setPosting] = useState(false)


  usePageTitle(complaint ? `${complaint.caseNumber} ${complaint.title}` : 'Complaint')

  // Remove the one time flag from browser history so a refresh does not show the message again
  useEffect(() => {
    if (location.state?.justFiled || location.state?.justEdited) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location, navigate])

  useEffect(() => {
    let ignore = false
    complaintsApi
      .get(id)
      .then((data) => {
        if (!ignore) setLoaded({ id, complaint: data, error: null })
      })
      .catch((err) => {
        if (!ignore) setLoaded({ id, complaint: null, error: err })
      })
    return () => {
      ignore = true
    }
  }, [id])

  // Admins need the list of active agents for the assign dropdown
  useEffect(() => {
    if (user.role !== 'admin') return
    usersApi
      .list({ role: 'agent', active: 'true' })
      .then(setAgents)
      .catch(() => setAgents([]))
  }, [user.role])

  if (loadError?.status === 410) {
    return (
      <EmptyState
        icon={Ban}
        title="This complaint was removed"
        action={
          <Link to="/complaints" className="btn btn--secondary">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to complaints
          </Link>
        }
      >
        The office removed this complaint. If you think this is a mistake, please contact the office.
      </EmptyState>
    )
  }

  if (loadError) {
    return (
      <EmptyState
        icon={FileQuestion}
        title={loadError.status === 404 ? 'We could not find that complaint' : 'This complaint could not be loaded'}
        action={
          <Link to="/complaints" className="btn btn--secondary">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to complaints
          </Link>
        }
      >
        {loadError.status === 404
          ? 'It may have a different link, or it belongs to someone else.'
          : loadError.message}
      </EmptyState>
    )
  }

  if (!complaint) {
    return (
      <div aria-busy="true" style={{ display: 'grid', gap: 16 }}>
        <span className="visually-hidden" role="status">
          Loading complaint
        </span>
        <Skeleton width={160} height={40} />
        <Skeleton width="60%" height={28} />
        <Skeleton width="100%" height={220} />
      </div>
    )
  }

  const isAdmin = user.role === 'admin'
  const isRemoved = Boolean(complaint.removed)
  const removal = removalOf(complaint)
  const actions = isRemoved ? [] : availableActions(user, complaint)
  const canAssign = isAdmin && !isRemoved && ['open', 'in_progress'].includes(complaint.status)
  // The resident can fix the details until work starts
  const canEdit = complaint.createdBy?._id === user._id && complaint.status === 'open' && !isRemoved
  const isClosed = complaint.status === 'closed'
  // A removed complaint shows a "Removed" sticker instead of its status
  const sticker = isRemoved ? 'removed' : complaint.status

  async function changeStatus(action) {
    if (action.needsNote && !note.trim()) {
      setActionError('Please add a short note first')
      return
    }
    setBusy(true)
    setActionError('')
    setActionDone('')
    try {
      const updated = await complaintsApi.updateStatus(complaint._id, action.to, note.trim() || undefined)
      setComplaint(updated)
      setPending(null)
      setNote('')
      setActionDone(`Status changed to ${STATUS_LABELS[updated.status]}.`)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function startAction(action) {
    setActionError('')
    setActionDone('')
    if (action.needsNote) {
      setPending(action)
      setNote('')
    } else {
      changeStatus(action)
    }
  }

  async function assign(event) {
    event.preventDefault()
    if (!agentId) {
      setActionError('Please choose an agent')
      return
    }
    setBusy(true)
    setActionError('')
    setActionDone('')
    try {
      const updated = await complaintsApi.assign(complaint._id, agentId)
      setComplaint(updated)
      setAgentId('')
      setActionDone(`Assigned to ${updated.assignedTo.name}.`)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function restoreComplaint() {
    setBusy(true)
    setActionError('')
    setActionDone('')
    try {
      const updated = await complaintsApi.restore(complaint._id)
      setComplaint(updated)
      setActionDone(`Restored. It is back in the lists as ${STATUS_LABELS[updated.status]}.`)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusy(false)
    }
  }

  // Errors are shown next to the comment by the Timeline
  async function removeComment(commentId) {
    setComplaint(await complaintsApi.removeComment(complaint._id, commentId))
  }

  async function restoreComment(commentId) {
    setComplaint(await complaintsApi.restoreComment(complaint._id, commentId))
  }

  async function postComment(event) {
    event.preventDefault()
    if (!comment.trim()) {
      setCommentError('Please write a comment first')
      return
    }
    setPosting(true)
    setCommentError('')
    try {
      const updated = await complaintsApi.comment(complaint._id, comment.trim())
      setComplaint(updated)
      setComment('')
    } catch (err) {
      setCommentError(err.message)
    } finally {
      setPosting(false)
    }
  }

  return (
    <>
      <Link to="/complaints" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        All complaints
      </Link>

      {notice === 'filed' && (
        <div className="case__notice">
          <Alert tone="success">
            Complaint filed. Your case number is <strong className="mono">{complaint.caseNumber}</strong>. Use it
            when you talk to the office.
          </Alert>
        </div>
      )}
      {notice === 'edited' && (
        <div className="case__notice">
          <Alert tone="success">Your changes are saved.</Alert>
        </div>
      )}
      {removal && (
        <div className="case__notice">
          <RemovalNotice entry={removal} isAdmin={isAdmin} />
        </div>
      )}

      <header className="case__head">
        <div className="case__number-row">
          <span className="case__number">{complaint.caseNumber}</span>
          {/* key makes React replay the stamp animation whenever the status changes */}
          <StatusSticker key={sticker} status={sticker} size="lg" stamped />
        </div>
        <h1 className="case__title">{complaint.title}</h1>
      </header>

      {/* On phones the side panel comes first, so the next action is right under the case number */}
      <div className="case">
        <article className="sheet case__sheet">
          <dl className="meta">
            <div>
              <dt>Category</dt>
              <dd>{complaint.category}</dd>
            </div>
            <div>
              <dt>Priority</dt>
              <dd>
                <PriorityTag priority={complaint.priority} />
              </dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{complaint.location}</dd>
            </div>
            <div>
              <dt>Filed</dt>
              <dd>{formatDateTime(complaint.createdAt)}</dd>
            </div>
            <div>
              <dt>Last update</dt>
              <dd>{timeAgo(complaint.updatedAt)}</dd>
            </div>
          </dl>

          <section className="case__section" aria-labelledby="description-title">
            <h2 id="description-title" className="section-title">
              Description
            </h2>
            <p className="description">{complaint.description}</p>
          </section>

          <section className="case__section" aria-labelledby="history-title">
            <h2 id="history-title" className="section-title">
              History and comments
            </h2>
            <Timeline
              complaint={complaint}
              onRemoveComment={isAdmin && !isRemoved ? removeComment : undefined}
              onRestoreComment={isAdmin && !isRemoved ? restoreComment : undefined}
            />

            {isRemoved || isClosed ? (
              <p className="panel__text" style={{ marginTop: 24 }}>
                This complaint is {isRemoved ? 'removed' : 'closed'}, so new comments are turned off.
              </p>
            ) : (
              <form className="comment-form" onSubmit={postComment} noValidate>
                <label htmlFor="comment" className="field__label">
                  Add a comment
                </label>
                <textarea
                  id="comment"
                  className="input"
                  maxLength={COMMENT_MAX}
                  placeholder={
                    user.role === 'resident'
                      ? 'Share an update or ask a question'
                      : 'Write an update for the resident'
                  }
                  value={comment}
                  onChange={(event) => {
                    setComment(event.target.value)
                    if (commentError) setCommentError('')
                  }}
                  aria-invalid={commentError ? 'true' : undefined}
                  aria-describedby={commentError ? 'comment-error' : undefined}
                />
                {commentError && (
                  <p id="comment-error" className="field__error">
                    {commentError}
                  </p>
                )}
                <div className="comment-form__foot">
                  <span className="char-count">
                    {comment.length} / {COMMENT_MAX}
                  </span>
                  <button type="submit" className="btn btn--primary" disabled={posting}>
                    {posting ? <span className="spinner" aria-hidden="true" /> : <Send size={16} aria-hidden="true" />}
                    Post comment
                  </button>
                </div>
              </form>
            )}
          </section>
        </article>

        <aside className="case__side">
          <section className="panel" aria-labelledby="next-title">
            <h2 id="next-title" className="panel__title">
              Next step
            </h2>

            <div className="live" aria-live="polite">
              {actionDone && <Alert tone="success">{actionDone}</Alert>}
            </div>
            {actionError && <Alert tone="error">{actionError}</Alert>}

            {actions.length === 0 && !isRemoved && <p className="panel__text">{waitingText(user, complaint)}</p>}

            {isRemoved && isAdmin && (
              <div className="panel__actions">
                <p className="panel__text">
                  Restoring puts it back in every list as {STATUS_LABELS[complaint.status]}
                  {complaint.assignedTo && <>, and {complaint.assignedTo.name} sees it again</>}.
                </p>
                <button type="button" className="btn btn--secondary btn--block" disabled={busy} onClick={restoreComplaint}>
                  {busy ? <span className="spinner" aria-hidden="true" /> : <Undo2 size={16} aria-hidden="true" />}
                  Restore complaint
                </button>
              </div>
            )}
            {isRemoved && !isAdmin && (
              <div className="panel__actions">
                <p className="panel__text">This complaint is closed for changes. You can file a new one any time.</p>
                <Link to="/complaints/new" className="btn btn--secondary btn--block">
                  <Plus size={16} aria-hidden="true" />
                  File a new complaint
                </Link>
              </div>
            )}

            {canEdit && (
              <div className="panel__actions">
                <Link to={`/complaints/${complaint._id}/edit`} className="btn btn--secondary btn--block">
                  <Pencil size={16} aria-hidden="true" />
                  Edit complaint
                </Link>
                <p className="panel__hint">Missed something? You can change the details until work starts.</p>
              </div>
            )}
            {actions.length > 0 && complaint.status === 'resolved' && !pending && (
              <p className="panel__text">
                {complaint.assignedTo?.name ?? 'The agent'} marked this as fixed. Please check and confirm, or reopen
                it if the problem is still there.
              </p>
            )}

            {actions.length > 0 && !pending && (
              <div className="panel__actions">
                {actions.map((action) => (
                  <button
                    key={action.to}
                    type="button"
                    className={`btn btn--block ${action.tone === 'secondary' ? 'btn--secondary' : 'btn--primary'}`}
                    disabled={busy}
                    onClick={() => startAction(action)}
                  >
                    {busy && !action.needsNote && <span className="spinner" aria-hidden="true" />}
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {pending && (
              <div className="note-box">
                <label htmlFor="status-note" className="field__label">
                  {pending.notePrompt}
                </label>
                <textarea
                  id="status-note"
                  className="input"
                  maxLength={500}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  autoFocus
                />
                <div className="note-box__buttons">
                  <button
                    type="button"
                    className="btn btn--ghost"
                    disabled={busy}
                    onClick={() => {
                      setPending(null)
                      setActionError('')
                    }}
                  >
                    Cancel
                  </button>
                  <button type="button" className="btn btn--primary" disabled={busy} onClick={() => changeStatus(pending)}>
                    {busy && <span className="spinner" aria-hidden="true" />}
                    {pending.label}
                  </button>
                </div>
              </div>
            )}

            {canAssign && (
              <form className="assign-form" onSubmit={assign}>
                <label htmlFor="agent" className="field__label">
                  {complaint.assignedTo ? 'Reassign to another agent' : 'Assign an agent'}
                </label>
                <select
                  id="agent"
                  className="input input--select"
                  value={agentId}
                  onChange={(event) => setAgentId(event.target.value)}
                >
                  <option value="">Choose an agent</option>
                  {agents
                    .filter((agent) => agent._id !== complaint.assignedTo?._id)
                    .map((agent) => (
                      <option key={agent._id} value={agent._id}>
                        {agent.name} ({agent.activeComplaints} active)
                      </option>
                    ))}
                </select>
                <button type="submit" className="btn btn--secondary btn--block" disabled={busy}>
                  {complaint.assignedTo ? 'Reassign' : 'Assign'}
                </button>
              </form>
            )}
          </section>

          <section className="panel" aria-labelledby="people-title">
            <h2 id="people-title" className="panel__title">
              People
            </h2>
            <ul className="people">
              <li className="person">
                <span className="avatar" aria-hidden="true">
                  {complaint.createdBy?.name?.[0] ?? '?'}
                </span>
                <span className="person__text">
                  <span className="person__sub">Filed by</span>
                  <strong>{complaint.createdBy?.name}</strong>
                  {user.role !== 'resident' && (
                    <span className="person__sub">
                      {[complaint.createdBy?.phone, complaint.createdBy?.address].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </span>
              </li>
              <li className="person">
                <span className="avatar" aria-hidden="true">
                  {complaint.assignedTo?.name?.[0] ?? '?'}
                </span>
                <span className="person__text">
                  <span className="person__sub">Agent</span>
                  <strong>{complaint.assignedTo?.name ?? 'Not assigned yet'}</strong>
                  {complaint.assignedTo?.phone && <span className="person__sub">{complaint.assignedTo.phone}</span>}
                </span>
              </li>
            </ul>
          </section>

          {isAdmin && !isRemoved && <RemoveComplaintPanel complaint={complaint} onRemoved={setComplaint} />}
        </aside>
      </div>
    </>
  )
}
