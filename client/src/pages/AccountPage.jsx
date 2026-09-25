import { useState } from 'react'
import Alert from '../components/Alert.jsx'
import { TextField } from '../components/Fields.jsx'
import { ROLE_LABELS } from '../constants.js'
import { useAuth } from '../context/useAuth.js'
import { usePageTitle } from '../hooks/usePageTitle.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateDetails(form, isResident) {
  const errors = {}
  if (!form.name.trim()) errors['account-name'] = 'Please enter your name'
  if (!EMAIL_PATTERN.test(form.email.trim())) errors['account-email'] = 'Please enter a valid email address'
  if (isResident && !form.address.trim()) errors['account-address'] = 'Please enter your house and street'
  return errors
}

function validatePassword(form) {
  const errors = {}
  if (!form.current) errors['current-password'] = 'Please enter your current password'
  if (form.next.length < 8) errors['new-password'] = 'Use at least 8 characters'
  else if (form.next === form.current) errors['new-password'] = 'Choose a password different from the current one'
  if (form.confirm !== form.next) errors['confirm-password'] = 'The two new passwords do not match'
  return errors
}

// Moves keyboard focus to the first field with a problem
function focusFirst(errors) {
  const first = Object.keys(errors)[0]
  if (first) document.getElementById(first)?.focus()
}

function DetailsForm() {
  const { user, updateProfile } = useAuth()
  const isResident = user.role === 'resident'
  const isDemo = user.email.endsWith('@demo.com')

  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    address: user.address || '',
  })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState(null)
  const [saving, setSaving] = useState(false)

  const update = (event) => {
    const { name, value } = event.target
    setForm({ ...form, [name]: value })
    if (errors[`account-${name}`]) setErrors({ ...errors, [`account-${name}`]: undefined })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const found = validateDetails(form, isResident)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      focusFirst(found)
      return
    }

    setSaving(true)
    setMessage(null)
    try {
      await updateProfile({ ...form, email: form.email.trim() })
      setMessage({ tone: 'success', text: 'Your details are saved.' })
    } catch (err) {
      setMessage({ tone: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="sheet form" onSubmit={handleSubmit} noValidate aria-labelledby="details-title">
      <h2 id="details-title" className="section-title account__title">
        Your details
      </h2>
      <p className="panel__text">
        You are logged in as <strong>{ROLE_LABELS[user.role]}</strong>. You can change your{' '}
        {isResident ? 'name, email, phone and address' : 'name, email and phone'} here.
      </p>

      <div aria-live="polite">{message && <Alert tone={message.tone}>{message.text}</Alert>}</div>

      <TextField
        id="account-name"
        name="name"
        label="Full name"
        autoComplete="name"
        value={form.name}
        onChange={update}
        error={errors['account-name']}
      />
      <TextField
        id="account-email"
        name="email"
        type="email"
        label="Email"
        hint={
          isDemo
            ? 'This is a demo account. If you change its email, its button on the login page stops working until you run npm run seed.'
            : 'You use this email to log in.'
        }
        autoComplete="email"
        value={form.email}
        onChange={update}
        error={errors['account-email']}
      />
      <TextField
        id="account-phone"
        name="phone"
        type="tel"
        label="Phone"
        optional
        autoComplete="tel"
        value={form.phone}
        onChange={update}
      />
      {isResident && (
        <TextField
          id="account-address"
          name="address"
          label="House and street"
          autoComplete="street-address"
          value={form.address}
          onChange={update}
          error={errors['account-address']}
        />
      )}

      <div className="form__actions">
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving && <span className="spinner" aria-hidden="true" />}
          {saving ? 'Saving' : 'Save details'}
        </button>
      </div>
    </form>
  )
}

function PasswordForm() {
  const { user, changePassword } = useAuth()
  const isDemo = user.email.endsWith('@demo.com')

  const empty = { current: '', next: '', confirm: '' }
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState(null)
  const [saving, setSaving] = useState(false)

  const fieldIds = { current: 'current-password', next: 'new-password', confirm: 'confirm-password' }
  const update = (event) => {
    const { name, value } = event.target
    setForm({ ...form, [name]: value })
    if (errors[fieldIds[name]]) setErrors({ ...errors, [fieldIds[name]]: undefined })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const found = validatePassword(form)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      focusFirst(found)
      return
    }

    setSaving(true)
    setMessage(null)
    try {
      await changePassword(form.current, form.next)
      setForm(empty)
      setMessage({ tone: 'success', text: 'Password changed. Other devices have been logged out.' })
    } catch (err) {
      setMessage({ tone: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="sheet form" onSubmit={handleSubmit} noValidate aria-labelledby="password-title">
      <h2 id="password-title" className="section-title account__title">
        Change password
      </h2>
      <p className="panel__text">
        {isDemo
          ? 'This is a demo account. After a change, its button on the login page stops working until you run npm run seed.'
          : 'After you change it, any other device where you are logged in will be logged out.'}
      </p>

      <div aria-live="polite">{message && <Alert tone={message.tone}>{message.text}</Alert>}</div>

      <TextField
        id="current-password"
        name="current"
        type="password"
        label="Current password"
        autoComplete="current-password"
        value={form.current}
        onChange={update}
        error={errors['current-password']}
      />
      <TextField
        id="new-password"
        name="next"
        type="password"
        label="New password"
        hint="At least 8 characters"
        autoComplete="new-password"
        value={form.next}
        onChange={update}
        error={errors['new-password']}
      />
      <TextField
        id="confirm-password"
        name="confirm"
        type="password"
        label="Type the new password again"
        autoComplete="new-password"
        value={form.confirm}
        onChange={update}
        error={errors['confirm-password']}
      />

      <div className="form__actions">
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving && <span className="spinner" aria-hidden="true" />}
          {saving ? 'Changing password' : 'Change password'}
        </button>
      </div>
    </form>
  )
}

export default function AccountPage() {
  usePageTitle('My account')

  return (
    <>
      <div className="page-head">
        <div className="page-head__text">
          <h1 className="page-title">My account</h1>
          <p className="page-summary">Keep your details up to date so the team can reach you.</p>
        </div>
      </div>

      <div className="account">
        <DetailsForm />
        <PasswordForm />
      </div>
    </>
  )
}
