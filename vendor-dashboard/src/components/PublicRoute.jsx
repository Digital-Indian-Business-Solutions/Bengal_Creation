import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Wraps public-only pages (e.g. Login).
// If the user is already authenticated, send them straight to the dashboard.
export default function PublicRoute({ children }) {
  const { authed } = useAuth()
  return authed ? <Navigate to="/" replace /> : children
}
