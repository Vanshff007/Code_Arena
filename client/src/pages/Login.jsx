import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/getErrorMessage';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-6 py-24">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Login</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="rounded-md border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="rounded-md border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
        >
          {submitting ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-600 hover:underline">
          Register
        </Link>
      </p>
    </main>
  );
}

export default Login;
