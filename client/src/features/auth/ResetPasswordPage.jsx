import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { readResetToken, validatePasswordReset } from './validation';
import { getErrorMessage } from '../../shared/getErrorMessage';
import Field from '../../shared/ui/Field';
import Button from '../../shared/ui/Button';
import { ErrorNote } from '../../shared/ui/PageHeader';
import AuthLayout from './AuthLayout';
import PasswordToggle from './PasswordToggle';

// Opened from the emailed link: /reset-password#token=...
function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [token] = useState(() => readResetToken(window.location.hash));
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Take the token out of the address bar and history once it is read.
  useEffect(() => {
    if (window.location.hash) window.history.replaceState(null, '', window.location.pathname);
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errors = validatePasswordReset(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    setSubmitting(true);
    try {
      await resetPassword({ token, password: form.password });
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not reset the password. Ask for a new link.'));
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Choose a new password"
      intro="This also logs you out on every other device."
      footer={
        <Link to="/forgot-password" className="font-semibold text-p1 hover:underline">
          Ask for a new link
        </Link>
      }
    >
      {!token ? (
        <ErrorNote>This reset link is incomplete. Open the link from the email again, or ask for a new one.</ErrorNote>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Field
            label="New password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={form.password}
            onChange={handleChange}
            error={fieldErrors.password}
            hint="At least 6 characters."
            required
            autoComplete="new-password"
            trailing={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword((s) => !s)} />}
          />
          <Field
            label="Confirm new password"
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            error={fieldErrors.confirmPassword}
            required
            autoComplete="new-password"
          />
          {error && <ErrorNote>{error}</ErrorNote>}
          <Button type="submit" loading={submitting} className="mt-2 w-full">
            Set new password
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}

export default ResetPasswordPage;
