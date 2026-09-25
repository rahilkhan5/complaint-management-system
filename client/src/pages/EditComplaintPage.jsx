import { ArrowLeft, FileQuestion, Lock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { complaintsApi } from '../api/services.js'
import ComplaintForm from '../components/ComplaintForm.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { Skeleton } from '../components/Skeleton.jsx'
import { usePageTitle } from '../hooks/usePageTitle.js'

// Residents can fix or add details until an agent starts work on the complaint
export default function EditComplaintPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Same loading pattern as the detail page: the result remembers which id it belongs to
  const [loaded, setLoaded] = useState({ id: null, complaint: null, error: null })
  const complaint = loaded.id === id ? loaded.complaint : null
  const loadError = loaded.id === id ? loaded.error : null

  usePageTitle(complaint ? `Edit ${complaint.caseNumber}` : 'Edit complaint')

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

  if (loadError) {
    return (
      <EmptyState
        icon={FileQuestion}
        title={
          loadError.status === 410
            ? 'This complaint was removed'
            : loadError.status === 404
              ? 'We could not find that complaint'
              : 'This complaint could not be loaded'
        }
        action={
          <Link to="/complaints" className="btn btn--secondary">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to complaints
          </Link>
        }
      >
        {loadError.message}
      </EmptyState>
    )
  }

  if (!complaint) {
    return (
      <div className="narrow" aria-busy="true" style={{ display: 'grid', gap: 16 }}>
        <span className="visually-hidden" role="status">
          Loading complaint
        </span>
        <Skeleton width={160} height={20} />
        <Skeleton width="50%" height={32} />
        <Skeleton width="100%" height={420} />
      </div>
    )
  }

  const backTo = `/complaints/${complaint._id}`

  if (complaint.status !== 'open') {
    return (
      <EmptyState
        icon={Lock}
        title="This complaint can no longer be edited"
        action={
          <Link to={backTo} className="btn btn--secondary">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to {complaint.caseNumber}
          </Link>
        }
      >
        Work on it has already started. If something is missing, add a comment on the complaint instead.
      </EmptyState>
    )
  }

  async function saveChanges(form) {
    await complaintsApi.update(complaint._id, form)
    navigate(backTo, { state: { justEdited: true } })
  }

  return (
    <div className="narrow">
      <Link to={backTo} className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Complaint {complaint.caseNumber}
      </Link>

      <div className="page-head">
        <div className="page-head__text">
          <h1 className="page-title">Edit complaint</h1>
          <p className="page-summary">
            Fix or add details while the complaint is still open. Once an agent starts work, you can only add comments.
          </p>
        </div>
      </div>

      <ComplaintForm
        initial={{
          title: complaint.title,
          category: complaint.category,
          priority: complaint.priority,
          location: complaint.location,
          description: complaint.description,
        }}
        cancelTo={backTo}
        submitLabel="Save changes"
        busyLabel="Saving changes"
        onSubmit={saveChanges}
      />
    </div>
  )
}
