import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from './ui/Spinner';

// Wraps routes that require a logged-in user. Redirects to /login if
// there's no authenticated user once the initial session check has
// resolved; shows a spinner (rather than flashing a redirect) while it's
// still in flight.
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <Spinner className="size-6 text-accent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
