import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { complaintsApi } from '../api/services.js'
import Alert from '../components/Alert.jsx'
import { SelectField, TextField } from '../components/Fields.jsx'
import { CATEGORIES, PRIORITY_LABELS } from '../constants.js'
import { useAuth } from '../context/useAuth.js'
import { usePageTitle } from '../hooks/usePageTitle.js'

const DESCRIPTION_MAX = 1000

// Same limits as the Complaint model on the server
function validate(form) {
  const errors = {}
  const title = form.title.trim()
  if (title.length < 5) errors.title = 'Please write at least 5 characters'
  else if (title.length > 100) errors.title = 'Please keep the title under 100 characters'
  if (!form.category) errors.category = 'Please choose a category'
  if (!form.location.trim()) errors.location = 'Please tell us where the problem is'
  const description = form.description.trim()
  if (description.length < 10) errors.description = 'Please describe the problem in at least 10 characters'
  else if (description.length > DESCRIPTION_MAX) errors.description = `Please keep it under ${DESCRIPTION_MAX} characters`
  return errors
}

export default function NewComplaintPage() {
  usePageTitle('File a complaint')
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    category: '',
    priority: 'medium',
    location: user.address || '',
    description: '',
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const update = (event) => {
    const { name, value } = event.target
    setForm({ ...form, [name]: value })
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
      const complaint = await complaintsApi.create(form)
      navigate(`/complaints/${complaint._id}`, { state: { justFiled: true } })
    } catch (err) {
      setServerError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="narrow">
      <Link to="/complaints" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        My complaints
      </Link>

      <div className="page-head">
        <div className="page-head__text">
          <h1 className="page-title">File a complaint</h1>
          <p className="page-summary">
            Tell us what is wrong and where. You will get a case number right away and can follow every update.
          </p>
        </div>
      </div>

      <form className="sheet form" onSubmit={handleSubmit} noValidate>
        {serverError && <Alert tone="error">{serverError}</Alert>}

        <TextField
          id="title"
          name="title"
          label="What is the problem?"
          hint="A short title, for example: Street light not working"
          maxLength={100}
          value={form.title}
          onChange={update}
          error={errors.title}
        />

        <div className="form__row form__row--2">
          <SelectField
            id="category"
            name="category"
            label="Category"
            placeholder="Choose a category"
            options={CATEGORIES.map((item) => ({ value: item, label: item }))}
            value={form.category}
            onChange={update}
            error={errors.category}
          />

          <fieldset className="field">
            <legend className="field__label">How urgent is it?</legend>
            <div className="segmented">
              {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                <label key={value} className="segmented__option">
                  <input
                    type="radio"
                    name="priority"
                    value={value}
                    checked={form.priority === value}
                    onChange={update}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <TextField
          id="location"
          name="location"
          label="Where is it?"
          hint="Block, street and house number, or a landmark"
          value={form.location}
          onChange={update}
          error={errors.location}
        />

        <div className="field">
          <TextField
            id="description"
            name="description"
            label="Describe the problem"
            hint="When did it start, and what have you noticed?"
            multiline
            rows={5}
            maxLength={DESCRIPTION_MAX}
            value={form.description}
            onChange={update}
            error={errors.description}
          />
          <span className="char-count">
            {form.description.length} / {DESCRIPTION_MAX}
          </span>
        </div>

        <div className="form__actions">
          <Link to="/complaints" className="btn btn--ghost">
            Cancel
          </Link>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting && <span className="spinner" aria-hidden="true" />}
            {submitting ? 'Filing complaint' : 'File complaint'}
          </button>
        </div>
      </form>
    </div>
  )
}
