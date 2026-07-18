import { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { getMyMatches } from '../services/matchService';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

const resultTone = { Win: 'success', Loss: 'error', Draw: 'muted' };

function formatDuration(ms) {
  const totalMinutes = Math.round(ms / 60000);
  return `${totalMinutes} min`;
}

function MatchHistory() {
  const [matches, setMatches] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyMatches()
      .then((res) => setMatches(res.data.matches))
      .catch(() => setError('Failed to load match history.'));
  }, []);

  return (
    <main className="animate-fade-in mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground">Match History</h1>
      <p className="mt-1 text-sm text-muted">Your past battles.</p>

      {!matches && !error && (
        <div className="flex justify-center py-12">
          <Spinner className="size-6 text-accent" />
        </div>
      )}
      {error && <p className="mt-6 text-sm text-error">{error}</p>}

      {matches?.length === 0 && (
        <Card className="mt-6 flex flex-col items-center gap-2 py-12 text-center">
          <History className="size-6 text-muted" />
          <p className="text-sm font-medium text-foreground">No matches yet</p>
          <p className="text-sm text-muted">Start a battle to begin building your history.</p>
        </Card>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {matches?.map((m) => (
          <Card key={m.matchId} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">
                vs {m.opponent} &middot; {m.problem}
              </p>
              <p className="mt-1 text-sm text-muted">
                {m.language ?? '—'} &middot; {formatDuration(m.durationMs)} &middot;{' '}
                {new Date(m.endedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge tone={resultTone[m.result]}>{m.result}</Badge>
              <span className={`text-xs ${m.ratingChange >= 0 ? 'text-success' : 'text-error'}`}>
                {m.ratingChange >= 0 ? '+' : ''}
                {m.ratingChange}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}

export default MatchHistory;
