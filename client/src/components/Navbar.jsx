import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
      <Link to="/" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        CodeArena
      </Link>
      <div className="flex items-center gap-4 text-sm">
        {user ? (
          <>
            <Link
              to="/dashboard"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              Dashboard
            </Link>
            <button
              onClick={logout}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-md bg-gray-900 px-3 py-1.5 text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
