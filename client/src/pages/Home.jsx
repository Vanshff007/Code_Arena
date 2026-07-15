import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Swords, ArrowRight } from 'lucide-react';
import { getHealth } from '../services/healthService';
import { useAuth } from '../hooks/useAuth';
import Badge from '../components/ui/Badge';

// This page doubles as a foundation smoke test: if the status badge reads
// "connected", the Axios service layer is successfully reaching the backend
// through CORS - unchanged behavior from before, just restyled.
function Home() {
  const { user } = useAuth();
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    getHealth()
      .then((res) => setStatus(res.db === 'connected' ? 'connected' : 'unreachable'))
      .catch(() => setStatus('unreachable'));
  }, []);

  const badgeTone = status === 'connected' ? 'success' : status === 'unreachable' ? 'error' : 'muted';

  return (
    <main className="animate-fade-in mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 py-28 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-card">
        <Swords className="size-7 text-accent" />
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
        CodeArena
      </h1>
      <p className="max-w-md text-balance text-muted">
        Real-time 1v1 competitive coding battles. Same problem, same constraints, first correct
        submission wins.
      </p>

      <NavLink
        to={user ? '/dashboard' : '/register'}
        className="group inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium
          text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-md"
      >
        {user ? 'Go to Dashboard' : 'Get Started'}
        <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </NavLink>

      <Badge tone={badgeTone}>
        <span
          className={`size-1.5 rounded-full ${
            badgeTone === 'success' ? 'bg-success' : badgeTone === 'error' ? 'bg-error' : 'bg-muted'
          }`}
        />
        Backend {status}
      </Badge>
    </main>
  );
}

export default Home;
