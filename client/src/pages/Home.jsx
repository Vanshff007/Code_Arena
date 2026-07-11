import { useEffect, useState } from 'react';
import { getHealth } from '../services/healthService';

// This page doubles as a foundation smoke test: if "Backend: connected"
// renders, Tailwind, React Router, and the Axios service layer are all
// correctly wired together end to end.
function Home() {
  const [status, setStatus] = useState('checking...');

  useEffect(() => {
    getHealth()
      .then((res) => setStatus(res.db === 'connected' ? 'connected' : 'unreachable'))
      .catch(() => setStatus('unreachable'));
  }, []);

  const statusColor = status === 'connected' ? 'text-green-600' : 'text-red-600';

  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 py-24 text-center">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">CodeArena</h1>
      <p className="text-gray-600 dark:text-gray-400">
        Real-time 1v1 competitive coding battles. Same problem, same constraints, first correct
        submission wins.
      </p>
      <p className="text-sm">
        Backend:{' '}
        <span className={statusColor}>
          {status === 'checking...' ? status : status}
        </span>
      </p>
    </main>
  );
}

export default Home;
