import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wraps a route so only authenticated users (optionally with a specific role)
 * can access it. Redirects to /login otherwise.
 *
 * Usage:
 *   <ProtectedRoute>          → any logged-in user
 *   <ProtectedRoute role="vendor"> → vendors only
 */
export default function ProtectedRoute({ children, role }) {
  const { currentUser } = useAuth();

  if (!currentUser) return <Navigate to="/login" replace />;

  // Vendors should never access customer/user routes — redirect to vendor panel
  if (currentUser.role === "vendor" && role !== "vendor") {
    return <Navigate to="/vendor" replace />;
  }

  if (role && currentUser.role !== role) {
    return <Navigate to={currentUser.role === "vendor" ? "/vendor" : "/"} replace />;
  }

  return children;
}
