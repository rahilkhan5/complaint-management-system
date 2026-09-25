import { UserPlus, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usersApi } from '../api/services.js'
import Alert from '../components/Alert.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { SelectField, TextField } from '../components/Fields.jsx'
import { Skeleton } from '../components/Skeleton.jsx'
import { useAuth } from '../context/useAuth.js'
import { usePageTitle } from '../hooks/usePageTitle.js'

const TABS = [
  { role: 'agent', label: 'Support agents' },
  { role: 'admin', label: 'Admins' },
  { role: 'resident', label: 'Residents' },
]

const EMPTY_FORM = { name: '', email: '', phone: '', role: 'agent', password: '' }
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors['staff-name'] = 'Please enter a name'
  if (!EMAIL_PATTERN.test(form.email.trim())) errors['staff-email'] = 'Please enter a valid email address'
  if (form.password.length < 8) errors['staff-password'] = 'Use at least 8 characters'
  return errors
}

export default function StaffPage() {
  usePageTitle('Staff')
  const { user } = useAuth()

  const [users, setUsers] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [tab, setTab] = useState('agent')
  const [message, setMessage] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    usersApi
      .list()
      .then(setUsers)
      .catch((err) => setLoadError(err.message))
  }, [])

  const visible = (users ?? []).filter((person) => person.role === tab)
  const countFor = (role) => (users ?? []).filter((person) => person.role === role).length

  const update = (event) => {
    const { name, value } = event.target
    setForm({ ...form, [name]: value })
    if (errors[`staff-${name}`]) setErrors({ ...errors, [`staff-${name}`]: undefined })
  }

  async function createStaff(event) {
    event.preventDefault()
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      document.getElementById(Object.keys(found)[0])?.focus()
      return
    }

    setSaving(true)
    setMessage(null)
    try {
      const created = await usersApi.createStaff({ ...form, email: form.email.trim() })
      setUsers([...users, created])
      setTab(created.role)
      setForm(EMPTY_FORM)
      setShowForm(false)
      setMessage({ tone: 'success', text: `${created.name} can now log in as ${created.email}.` })
    } catch (err) {
      setMessage({ tone: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(person) {
    setUpdatingId(person._id)
    setMessage(null)
    try {
      const updated = await usersApi.setActive(person._id, !person.isActive)
      setUsers(users.map((item) => (item._id === updated._id ? { ...item, ...updated } : item)))
      setMessage({
        tone: 'success',
        text: updated.isActive ? `${updated.name} can log in again.` : `${updated.name} can no longer log in.`,
      })
    } catch (err) {
      setMessage({ tone: 'error', text: err.message })
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <>
      <div className="page-head">
        <div className="page-head__text">
          <h1 className="page-title">Staff and residents</h1>
          <p className="page-summary">Add support agents, see how much work each one holds, and turn accounts off.</p>
        </div>
        {!showForm && (
          <button type="button" className="btn btn--primary" onClick={() => setShowForm(true)}>
            <UserPlus size={18} aria-hidden="true" />
            Add staff account
          </button>
        )}
      </div>

      {showForm && (
        <form className="sheet form staff-form" onSubmit={createStaff} noValidate aria-labelledby="staff-form-title">
          <h2 id="staff-form-title" className="section-title" style={{ marginBottom: 0 }}>
            New staff account
          </h2>
          <div className="form__row form__row--2">
            <TextField id="staff-name" name="name" label="Full name" value={form.name} onChange={update} error={errors['staff-name']} />
            <TextField
              id="staff-email"
              name="email"
              type="email"
              label="Email"
              value={form.email}
              onChange={update}
              error={errors['staff-email']}
            />
          </div>
          <div className="form__row form__row--2">
            <TextField id="staff-phone" name="phone" type="tel" label="Phone" optional value={form.phone} onChange={update} />
            <SelectField
              id="staff-role"
              name="role"
              label="Role"
              options={[
                { value: 'agent', label: 'Support agent' },
                { value: 'admin', label: 'Admin' },
              ]}
              value={form.role}
              onChange={update}
            />
          </div>
          <TextField
            id="staff-password"
            name="password"
            type="password"
            label="Temporary password"
            hint="At least 8 characters. Share it with the person privately."
            autoComplete="new-password"
            value={form.password}
            onChange={update}
            error={errors['staff-password']}
          />
          <div className="form__actions">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setShowForm(false)
                setErrors({})
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving && <span className="spinner" aria-hidden="true" />}
              {saving ? 'Creating account' : 'Create account'}
            </button>
          </div>
        </form>
      )}

      <div role="tablist" aria-label="Account type" className="tabs">
        {TABS.map((item) => (
          <button
            key={item.role}
            type="button"
            role="tab"
            id={`tab-${item.role}`}
            aria-selected={tab === item.role}
            aria-controls="roster"
            className="tabs__tab"
            onClick={() => setTab(item.role)}
          >
            {item.label}
            <span className="index__count">{users ? countFor(item.role) : ''}</span>
          </button>
        ))}
      </div>

      <div aria-live="polite">
        {message && (
          <div style={{ marginBottom: 16 }}>
            <Alert tone={message.tone}>{message.text}</Alert>
          </div>
        )}
      </div>

      {loadError && <Alert tone="error">{loadError}</Alert>}

      {!loadError && !users && (
        <div style={{ display: 'grid', gap: 12 }} aria-hidden="true">
          <Skeleton height={56} />
          <Skeleton height={56} />
          <Skeleton height={56} />
        </div>
      )}

      {users && visible.length === 0 && (
        <EmptyState icon={Users} title="Nobody here yet">
          {tab === 'resident' ? 'Residents appear here after they create an account.' : 'Use "Add staff account" to add one.'}
        </EmptyState>
      )}

      {users && visible.length > 0 && (
        <div id="roster" role="tabpanel" aria-labelledby={`tab-${tab}`}>
          <div className="roster">
            <div className="roster__head" aria-hidden="true">
              <span>Name</span>
              <span>Phone</span>
              <span>{tab === 'agent' ? 'Active work' : ''}</span>
              <span>Account</span>
              <span />
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {visible.map((person) => {
                const isMe = person._id === user._id
                return (
                  <li key={person._id} className={`roster__row${person.isActive ? '' : ' is-inactive'}`}>
                    <div className="person">
                      <span className="avatar" aria-hidden="true">
                        {person.name[0]}
                      </span>
                      <span className="person__text">
                        <strong>
                          {person.name}
                          {isMe && <span className="role-chip">You</span>}
                        </strong>
                        <span className="person__sub">{person.email}</span>
                      </span>
                    </div>
                    <span className="roster__cell roster__cell--phone">{person.phone || 'No phone'}</span>
                    <span className="roster__cell roster__cell--load">
                      {tab === 'agent' &&
                        `${person.activeComplaints} ${person.activeComplaints === 1 ? 'complaint' : 'complaints'}`}
                    </span>
                    <span className="roster__cell roster__cell--state">
                      <span className={`state${person.isActive ? '' : ' state--off'}`}>
                        {person.isActive ? 'Active' : 'Turned off'}
                      </span>
                    </span>
                    <span className="roster__action">
                      {!isMe && (
                        <button
                          type="button"
                          className={`btn btn--sm ${person.isActive ? 'btn--danger' : 'btn--secondary'}`}
                          disabled={updatingId === person._id}
                          onClick={() => toggleActive(person)}
                        >
                          {person.isActive ? 'Turn off' : 'Turn on'}
                          <span className="visually-hidden"> {person.name}</span>
                        </button>
                      )}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
