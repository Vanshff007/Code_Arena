import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { getErrorMessage } from '../../shared/getErrorMessage';
import Field from '../../shared/ui/Field';
import Button from '../../shared/ui/Button';
import { ErrorNote } from '../../shared/ui/PageHeader';
import AuthLayout from './AuthLayout';
import PasswordToggle from './PasswordToggle';
import { validateRegistration } from './validation';

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = validateRegistration(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const { confirmPassword: _confirm, ...payload } = form;
      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create the account. Try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const toggle = <PasswordToggle shown={showPassword} onToggle={() => setShowPassword((s) => !s)} />;

  return (
    <AuthLayout
      title="Create account"
      intro="Every new player starts at a rating of 1,000."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-p1 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Field
          label="Username"
          name="username"
          value={form.username}
          onChange={handleChange}
          autoComplete="username"
          hint="Shown to opponents. Letters and numbers, 3 to 20 characters."
          error={fieldErrors.username}
        />
        <Field
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
          error={fieldErrors.email}
        />
        <Field
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={form.password}
          onChange={handleChange}
          autoComplete="new-password"
          error={fieldErrors.password}
          trailing={toggle}
        />
        <Field
          label="Confirm password"
          type={showPassword ? 'text' : 'password'}
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
          error={fieldErrors.confirmPassword}
        />

        {error && <ErrorNote>{error}</ErrorNote>}

        <Button type="submit" loading={submitting} className="mt-2 w-full">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}

export default RegisterPage;
