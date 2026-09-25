import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../context/useAuth.js'

// Sends logged out users to /login, and users with the wrong role back to the list.
// The server checks roles again on every request; this only keeps the UI tidy.
export default function ProtectedRoute({ roles }) {
  const { user, checking } = useAuth()
  const location = useLocation()

  if (checking) {
    return (
      <div className="screen-center" role="status">
        <span className="spinner" aria-hidden="true" />
        <span>Loading your account</span>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />

  if (roles && !roles.includes(user.role)) return <Navigate to="/complaints" replace />

  return <Outlet />
}
