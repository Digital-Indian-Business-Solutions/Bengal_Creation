import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';

export default function ProtectedRoute({ children }) {
  const { authed } = useAuth();
  return authed ? children : <Login />;
}
