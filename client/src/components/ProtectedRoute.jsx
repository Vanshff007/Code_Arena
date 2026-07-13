import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Wraps routes that require a logged-in user. Redirects to /login if
// there's no authenticated user once the initial session check has
// resolved; shows nothing (rather than flashing a redirect) while it's
// still in flight.
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="px-6 py-24 text-center text-gray-500 dark:text-gray-400">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
