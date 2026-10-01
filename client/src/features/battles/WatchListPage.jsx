import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { getLiveBattles } from './matchService';
import DifficultyMeter from '../problems/DifficultyMeter';
import { formatClock, formatNumber } from '../../shared/format';
import PageHeader, { EmptyState, ErrorNote } from '../../shared/ui/PageHeader';
import { ButtonLink } from '../../shared/ui/Button';
import { PageSpinner } from '../../shared/ui/Spinner';

const REFRESH_MS = 10_000;

// Battles happening right now. Spectators see progress and chat, never
// code (code shows in the replay afterwards, to the players).
function WatchListPage() {
  const [battles, setBattles] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = () =>
      getLiveBattles()
        .then((res) => {
          setBattles(res.data.battles);
          setError('');
        })
        .catch(() => setError('Could not load live battles. Retrying.'));
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader title="Watch">
        Battles in progress right now. You'll see both players' progress, the clock and their chat. Code stays hidden
        until the battle ends.
      </PageHeader>

      <div className="mt-6">
        {error && <ErrorNote>{error}</ErrorNote>}
        {!battles && !error && <PageSpinner label="Loading live battles" />}
        {battles?.length === 0 && (
          <EmptyState title="No battles right now" action={<ButtonLink to="/battle">Start one</ButtonLink>}>
            This list refreshes on its own every few seconds.
          </EmptyState>
        )}
        {battles?.length > 0 && (
          <ul className="flex flex-col gap-px border border-rule bg-rule">
            {battles.map((b) => (
              <li key={b.roomCode} className="flex flex-wrap items-center gap-x-6 gap-y-2 bg-panel px-4 py-4">
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-2 font-wide font-extrabold">
                    <span className="text-p1">{b.players[0]?.username}</span>
                    <span className="font-tight text-sm font-semibold text-muted">{formatNumber(b.players[0]?.rating)}</span>
                    <span className="text-muted">vs</span>
                    <span className="text-p2">{b.players[1]?.username}</span>
                    <span className="font-tight text-sm font-semibold text-muted">{formatNumber(b.players[1]?.rating)}</span>
                  </span>
                  <span className="mt-1 flex items-center gap-3 text-sm text-muted">
                    {b.problem.title}
                    <DifficultyMeter difficulty={b.problem.difficulty} showLabel={false} />
                  </span>
                </span>
                <span className="font-tight text-2xl font-black">{formatClock(b.remainingMs)}</span>
                <span className="flex items-center gap-1.5 text-sm text-muted" title="Spectators">
                  <Eye aria-hidden className="size-4" /> {b.spectators}
                </span>
                <Link
                  to={`/watch/${b.roomCode}`}
                  className="font-semibold text-p1 hover:underline"
                  aria-label={`Watch ${b.players[0]?.username} vs ${b.players[1]?.username}`}
                >
                  Watch
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

export default WatchListPage;
