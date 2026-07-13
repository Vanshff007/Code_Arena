import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/getErrorMessage';

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const { confirmPassword, ...payload } = form;
      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-6 py-24">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Register</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
          className="rounded-md border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        />
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
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm password"
          value={form.confirmPassword}
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
          {submitting ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:underline">
          Login
        </Link>
      </p>
    </main>
  );
}

export default Register;
