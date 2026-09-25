import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import Alert from '../components/Alert.jsx'
import { TextField } from '../components/Fields.jsx'
import Logo from '../components/Logo.jsx'
import { useAuth } from '../context/useAuth.js'
import { usePageTitle } from '../hooks/usePageTitle.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Checks the form in the browser first so people get instant feedback.
// The server runs the same checks again.
function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Please enter your name'
  if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Please enter a valid email address'
  if (!form.address.trim()) errors.address = 'Please enter your house and street'
  if (form.password.length < 8) errors.password = 'Use at least 8 characters'
  return errors
}

export default function RegisterPage() {
  usePageTitle('Create account')
  const { user, register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/complaints" replace />

  const update = (event) => {
    const { name, value } = event.target
    setForm({ ...form, [name]: value })
    // Clear a field's error as soon as the user starts fixing it
    if (errors[name]) setErrors({ ...errors, [name]: undefined })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      document.getElementById(Object.keys(found)[0])?.focus()
      return
    }

    setServerError('')
    setSubmitting(true)
    try {
      await register({ ...form, email: form.email.trim() })
      navigate('/complaints', { replace: true })
    } catch (err) {
      setServerError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="auth">
      <main className="auth__panel">
        <div className="auth__intro">
          <Logo />
          <h1 className="auth__title">Create a resident account</h1>
          <p className="auth__lead">You will use this account to file complaints and follow their progress.</p>
        </div>

        <form className="form" onSubmit={handleSubmit} noValidate>
          {serverError && <Alert tone="error">{serverError}</Alert>}
          <TextField id="name" name="name" label="Full name" autoComplete="name" value={form.name} onChange={update} error={errors.name} />
          <TextField
            id="email"
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            value={form.email}
            onChange={update}
            error={errors.email}
          />
          <TextField
            id="phone"
            name="phone"
            type="tel"
            label="Phone"
            optional
            autoComplete="tel"
            placeholder="0300 1234567"
            value={form.phone}
            onChange={update}
          />
          <TextField
            id="address"
            name="address"
            label="House and street"
            hint="So the maintenance team can find you, for example Block C, Street 4, House 27"
            autoComplete="street-address"
            value={form.address}
            onChange={update}
            error={errors.address}
          />
          <TextField
            id="password"
            name="password"
            type="password"
            label="Password"
            hint="At least 8 characters"
            autoComplete="new-password"
            value={form.password}
            onChange={update}
            error={errors.password}
          />
          <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
            {submitting && <span className="spinner" aria-hidden="true" />}
            {submitting ? 'Creating account' : 'Create account'}
          </button>
          <p className="auth__switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </main>

      <aside className="auth__aside" aria-hidden="true">
        <div>
          <h2 className="auth__aside-title">Report it once. Follow it to the end.</h2>
          <p className="auth__aside-text">
            After you file a complaint you get a case number. You can see who is working on it, read their notes and
            reply, and close it yourself once it is fixed.
          </p>
        </div>
      </aside>
    </div>
  )
}
