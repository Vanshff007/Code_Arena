import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from './authService';
import { getErrorMessage } from '../../shared/getErrorMessage';
import Field from '../../shared/ui/Field';
import Button from '../../shared/ui/Button';
import { ErrorNote } from '../../shared/ui/PageHeader';
import AuthLayout from './AuthLayout';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await requestPasswordReset(email);
      setSent(res.message);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not send the link. Try again in a few minutes.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      intro="Enter the email you signed up with. We'll send you a link to choose a new password."
      footer={
        <>
          Remembered it?{' '}
          <Link to="/login" className="font-semibold text-p1 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      {sent ? (
        <div role="status" className="flex flex-col gap-2">
          <p className="font-semibold">Check your email</p>
          <p className="text-sm text-muted">{sent} Look in your spam folder if it has not arrived.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          {error && <ErrorNote>{error}</ErrorNote>}
          <Button type="submit" loading={submitting} className="mt-2 w-full">
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
