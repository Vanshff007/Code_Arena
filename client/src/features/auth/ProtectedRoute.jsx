import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { PageSpinner } from '../../shared/ui/Spinner';

// Wraps routes that require a logged-in user. Redirects to /login if
// there's no authenticated user once the initial session check has
// resolved; shows a spinner (rather than flashing a redirect) while it's
// still in flight.
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <PageSpinner label="Checking your session" />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRoute;
