import { Navigate, Route, Routes } from 'react-router'
import AppShell from './components/AppShell.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import ComplaintDetailPage from './pages/ComplaintDetailPage.jsx'
import ComplaintsPage from './pages/ComplaintsPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NewComplaintPage from './pages/NewComplaintPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import StaffPage from './pages/StaffPage.jsx'

export default function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Everything below needs a logged in user and shares the header */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/complaints" replace />} />
          <Route path="complaints" element={<ComplaintsPage />} />
          <Route path="complaints/:id" element={<ComplaintDetailPage />} />

          <Route element={<ProtectedRoute roles={['resident']} />}>
            <Route path="complaints/new" element={<NewComplaintPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="staff" element={<StaffPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
