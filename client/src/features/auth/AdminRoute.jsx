import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import ProtectedRoute from './ProtectedRoute';

// Admin-only pages. The server checks the role again on every admin
// request; this only keeps non-admins out of screens they can't use.
function AdminRoute({ children }) {
  const { user } = useAuth();
  return <ProtectedRoute>{user?.role === 'admin' ? children : <Navigate to="/dashboard" replace />}</ProtectedRoute>;
}

export default AdminRoute;
