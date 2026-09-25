import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { complaintsApi } from '../api/services.js'
import ComplaintForm from '../components/ComplaintForm.jsx'
import { useAuth } from '../context/useAuth.js'
import { usePageTitle } from '../hooks/usePageTitle.js'

export default function NewComplaintPage() {
  usePageTitle('File a complaint')
  const { user } = useAuth()
  const navigate = useNavigate()

  async function fileComplaint(form) {
    const complaint = await complaintsApi.create(form)
    navigate(`/complaints/${complaint._id}`, { state: { justFiled: true } })
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

      <ComplaintForm
        initial={{ title: '', category: '', priority: 'medium', location: user.address || '', description: '' }}
        cancelTo="/complaints"
        submitLabel="File complaint"
        busyLabel="Filing complaint"
        onSubmit={fileComplaint}
      />
    </div>
  )
}
