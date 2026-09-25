import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import Alert from '../components/Alert.jsx'
import { TextField } from '../components/Fields.jsx'
import Logo from '../components/Logo.jsx'
import StatusSticker from '../components/StatusSticker.jsx'
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../constants.js'
import { useAuth } from '../context/useAuth.js'
import { usePageTitle } from '../hooks/usePageTitle.js'

// Sample files shown next to the login form on wide screens
const SAMPLE_FILES = [
  { caseNumber: 'CMS-0008', title: 'Water pressure very low since Monday', place: 'Block A, Street 2', status: 'in_progress' },
  { caseNumber: 'CMS-0005', title: 'Street light not working near the park', place: 'Block C, Street 4', status: 'resolved' },
  { caseNumber: 'CMS-0010', title: 'Garbage not collected for three days', place: 'Block B, Street 7', status: 'open' },
]

export default function LoginPage() {
  usePageTitle('Log in')
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Already logged in: nothing to do here
  if (user) return <Navigate to="/complaints" replace />

  const goNext = () => navigate(location.state?.from || '/complaints', { replace: true })

  async function signIn(email, password) {
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      goNext()
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!form.email.trim() || !form.password) {
      setError('Please enter your email and password')
      return
    }
    signIn(form.email.trim(), form.password)
  }

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  return (
    <div className="auth">
      <main className="auth__panel">
        <div className="auth__intro">
          <Logo />
          <h1 className="auth__title">Log in to your account</h1>
          <p className="auth__lead">File a complaint, follow it by case number, and see every update in one place.</p>
        </div>

        <form className="form" onSubmit={handleSubmit} noValidate>
          {error && <Alert tone="error">{error}</Alert>}
          <TextField
            id="email"
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            value={form.email}
            onChange={update}
          />
          <TextField
            id="password"
            name="password"
            type="password"
            label="Password"
            autoComplete="current-password"
            value={form.password}
            onChange={update}
          />
          <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
            {submitting && <span className="spinner" aria-hidden="true" />}
            {submitting ? 'Logging in' : 'Log in'}
          </button>
          <p className="auth__switch">
            New resident? <Link to="/register">Create an account</Link>
          </p>
        </form>

        <section className="demo" aria-labelledby="demo-title">
          <h2 id="demo-title" className="demo__title">
            Try a demo account
          </h2>
          <p className="demo__text">Each role sees a different part of the system.</p>
          <ul className="demo__list">
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.role}>
                <button
                  type="button"
                  className="demo__button"
                  disabled={submitting}
                  onClick={() => signIn(account.email, DEMO_PASSWORD)}
                >
                  <span className="demo__role">Log in as {account.label}</span>
                  <span className="demo__hint">{account.hint}</span>
                  <ChevronRight size={18} className="demo__arrow" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <aside className="auth__aside" aria-hidden="true">
        <ul className="stack">
          {SAMPLE_FILES.map((file) => (
            <li key={file.caseNumber} className="stack__file" data-status={file.status}>
              <span className="file__tab">{file.caseNumber}</span>
              <div className="file__body">
                <div className="file__main">
                  <span className="file__title">{file.title}</span>
                  <span className="file__meta">{file.place}</span>
                </div>
                <div>
                  <StatusSticker status={file.status} />
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div>
          <h2 className="auth__aside-title">Every complaint gets a case number.</h2>
          <p className="auth__aside-text">
            Residents file it, the office assigns an agent, and every step is written down until the problem is fixed.
          </p>
        </div>
      </aside>
    </div>
  )
}
