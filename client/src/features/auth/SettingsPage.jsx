import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { changePassword } from './authService';
import { validatePasswordChange } from './validation';
import { useTheme } from '../../shared/useTheme';
import { THEMES } from '../../shared/theme';
import { getErrorMessage } from '../../shared/getErrorMessage';
import Field from '../../shared/ui/Field';
import Button from '../../shared/ui/Button';
import PageHeader, { SectionTitle, ErrorNote } from '../../shared/ui/PageHeader';

const THEME_LABELS = { system: 'Match my device', light: 'Light', dark: 'Dark' };

function SettingsPage() {
  const { logoutAll } = useAuth();
  const { preference, setPreference } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState({ type: null, message: '' });
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submitPassword = async (e) => {
    e.preventDefault();
    const errors = validatePasswordChange(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    setSaving(true);
    setStatus({ type: null, message: '' });
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setStatus({ type: 'ok', message: 'Password changed. Other devices have been logged out.' });
    } catch (err) {
      setStatus({ type: 'error', message: getErrorMessage(err, 'Could not change the password.') });
    } finally {
      setSaving(false);
    }
  };

  const signOutEverywhere = async () => {
    if (!window.confirm('Log out on every device, including this one?')) return;
    setSigningOut(true);
    try {
      await logoutAll();
      navigate('/login');
    } catch (err) {
      setStatus({ type: 'error', message: getErrorMessage(err) });
      setSigningOut(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader title="Settings" />

      <div className="max-w-md">
        <SectionTitle>Appearance</SectionTitle>
        <div role="radiogroup" aria-label="Theme" className="flex border border-rule bg-panel p-0.5">
          {THEMES.map((t) => (
            <button
              key={t}
              role="radio"
              aria-checked={preference === t}
              onClick={() => setPreference(t)}
              className={`flex-1 px-3 py-2 text-sm font-semibold ${preference === t ? 'bg-ink text-paper' : 'text-muted hover:text-ink'}`}
            >
              {THEME_LABELS[t]}
            </button>
          ))}
        </div>

        <SectionTitle>Change password</SectionTitle>
        <form onSubmit={submitPassword} noValidate className="flex flex-col gap-4">
          <Field
            label="Current password"
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            autoComplete="current-password"
            error={fieldErrors.currentPassword}
          />
          <Field
            label="New password"
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            autoComplete="new-password"
            hint="At least 6 characters."
            error={fieldErrors.newPassword}
          />
          <Field
            label="Confirm new password"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            error={fieldErrors.confirmPassword}
          />
          <Button type="submit" loading={saving} className="self-start">
            Change password
          </Button>
        </form>
        {status.type === 'ok' && (
          <p role="status" className="mt-3 text-sm text-ok">
            {status.message}
          </p>
        )}
        {status.type === 'error' && (
          <div className="mt-3">
            <ErrorNote>{status.message}</ErrorNote>
          </div>
        )}

        <SectionTitle>Sessions</SectionTitle>
        <p className="text-sm text-muted">
          Lost a device or used a shared computer? This logs you out everywhere, including here.
        </p>
        <Button variant="danger" className="mt-3" onClick={signOutEverywhere} loading={signingOut}>
          Log out on all devices
        </Button>
      </div>
    </main>
  );
}

export default SettingsPage;
