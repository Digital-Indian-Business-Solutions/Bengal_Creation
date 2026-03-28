import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { authed } = useAuth()
  const location = useLocation()

  if (!authed) {
    // Pass `from` so Login can redirect back after successful auth
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
