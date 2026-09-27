import { Ban } from 'lucide-react'
import { useState } from 'react'
import { complaintsApi } from '../api/services.js'
import { REMOVAL_REASONS } from '../constants.js'
import { timeAgo } from '../utils/format.js'
import Alert from './Alert.jsx'
import { SelectField, TextField } from './Fields.jsx'

const MESSAGE_MAX = 500

// The last comment someone from the office wrote to the resident, if any
function lastOfficeComment(complaint) {
  return complaint.comments.filter((comment) => !comment.removed && comment.author?.role !== 'resident').at(-1)
}

// Admins only. Removing asks for a reason from a fixed list, because the resident will read it.
export default function RemoveComplaintPanel({ complaint, onRemoved }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ reason: '', message: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [busy, setBusy] = useState(false)

  const update = (event) => {
    const { name, value } = event.target
    setForm({ ...form, [name]: value })
    if (errors[name]) setErrors({ ...errors, [name]: undefined })
  }

  function close() {
    setOpen(false)
    setErrors({})
    setServerError('')
  }

  async function remove() {
    const found = {}
    if (!form.reason) found.reason = 'Please choose a reason'
    if (form.reason === 'other' && !form.message.trim()) found.message = 'Please tell the resident why'
    setErrors(found)
    if (Object.keys(found).length > 0) {
      document.getElementById(found.reason ? 'remove-reason' : 'remove-message')?.focus()
      return
    }

    setBusy(true)
    setServerError('')
    try {
      const updated = await complaintsApi.remove(complaint._id, form.reason, form.message.trim())
      onRemoved(updated)
    } catch (err) {
      setServerError(err.message)
      setBusy(false)
    }
  }

  const asked = lastOfficeComment(complaint)

  return (
    <section className="panel" aria-labelledby="remove-title">
      <h2 id="remove-title" className="panel__title">
        Remove complaint
      </h2>

      {!open ? (
        <>
          <p className="panel__text">
            For rude or useless complaints. The agent stops seeing it, and the resident sees that it was removed and
            why. You can restore it later.
          </p>
          <button type="button" className="btn btn--danger btn--block" onClick={() => setOpen(true)}>
            <Ban size={16} aria-hidden="true" />
            Remove complaint
          </button>
        </>
      ) : (
        <div className="note-box">
          {serverError && <Alert tone="error">{serverError}</Alert>}

          <SelectField
            id="remove-reason"
            name="reason"
            label="Why are you removing it?"
            hint="The resident will see this reason."
            placeholder="Choose a reason"
            options={Object.entries(REMOVAL_REASONS).map(([value, label]) => ({ value, label }))}
            value={form.reason}
            onChange={update}
            error={errors.reason}
            autoFocus
          />

          {/* A missing house number is no reason to throw a complaint away: ask first */}
          {form.reason === 'incomplete' && (
            <Alert tone="info">
              {asked ? (
                <>
                  The office last wrote to the resident {timeAgo(asked.createdAt)}. If they have not answered, you
                  can remove it.
                </>
              ) : (
                <>
                  <strong>Did you ask for the missing details first?</strong> Nobody from the office has commented
                  yet. Ask in a comment instead: the resident can edit the complaint and fix it.
                </>
              )}
            </Alert>
          )}

          <TextField
            id="remove-message"
            name="message"
            label="Message to the resident"
            optional={form.reason !== 'other'}
            hint="Shown to the resident with the reason. Keep it polite."
            multiline
            rows={3}
            maxLength={MESSAGE_MAX}
            value={form.message}
            onChange={update}
            error={errors.message}
          />

          <div className="note-box__buttons">
            <button type="button" className="btn btn--ghost" disabled={busy} onClick={close}>
              Cancel
            </button>
            <button type="button" className="btn btn--danger" disabled={busy} onClick={remove}>
              {busy && <span className="spinner" aria-hidden="true" />}
              Remove
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
