import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <main className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">404</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Page not found.</p>
      <Link to="/" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
        Back home
      </Link>
    </main>
  );
}

export default NotFound;
