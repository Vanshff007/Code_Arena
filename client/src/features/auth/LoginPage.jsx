import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { getErrorMessage } from '../../shared/getErrorMessage';
import Field from '../../shared/ui/Field';
import Button from '../../shared/ui/Button';
import { ErrorNote } from '../../shared/ui/PageHeader';
import AuthLayout from './AuthLayout';
import PasswordToggle from './PasswordToggle';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
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
      setError(getErrorMessage(err, 'Log in failed. Check your email and password.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Log in"
      intro="Pick up where your rating left off."
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-semibold text-p1 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          autoComplete="email"
        />
        <Field
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
          trailing={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword((s) => !s)} />}
        />

        {error && <ErrorNote>{error}</ErrorNote>}

        <Button type="submit" loading={submitting} className="mt-2 w-full">
          Log in
        </Button>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
