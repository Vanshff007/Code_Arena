import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Swords } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/getErrorMessage';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

function Login() {
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
      setError(getErrorMessage(err, 'Login failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="animate-fade-in mx-auto flex min-h-[calc(100vh-64px)] max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-card">
          <Swords className="size-5 text-accent" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="text-sm text-muted">Log in to keep battling.</p>
      </div>

      <Card className="backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            icon={Mail}
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />

          <div className="relative">
            <Input
              icon={Lock}
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" loading={submitting} className="mt-1 w-full">
            {submitting ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-muted">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-accent hover:underline">
          Register
        </Link>
      </p>
    </main>
  );
}

export default Login;
