import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import { usePageTitle } from '../hooks/usePageTitle.js'

export default function NotFoundPage() {
  usePageTitle('Page not found')
  return (
    <div className="lost">
      <span className="lost__code">404</span>
      <h1 className="page-title">This page does not exist</h1>
      <p className="page-summary">The link may be old or mistyped.</p>
      <Link to="/complaints" className="btn btn--secondary">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to complaints
      </Link>
    </div>
  )
}
