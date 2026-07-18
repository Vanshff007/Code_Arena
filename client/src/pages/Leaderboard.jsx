import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { getLeaderboard } from '../services/leaderboardService';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';

function Leaderboard() {
  const { user } = useAuth();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getLeaderboard()
      .then((res) => setRows(res.data.leaderboard))
      .catch(() => setError('Failed to load leaderboard.'));
  }, []);

  return (
    <main className="animate-fade-in mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
      <p className="mt-1 text-sm text-muted">Top players by rating.</p>

      {!rows && !error && (
        <div className="flex justify-center py-12">
          <Spinner className="size-6 text-accent" />
        </div>
      )}
      {error && <p className="mt-6 text-sm text-error">{error}</p>}

      {rows?.length === 0 && (
        <Card className="mt-6 py-12 text-center text-sm text-muted">No ranked players yet.</Card>
      )}

      {rows?.length > 0 && (
        <Card className="mt-6 overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3 text-right">Rating</th>
                <th className="px-4 py-3 text-right">Wins</th>
                <th className="px-4 py-3 text-right">Win rate</th>
                <th className="px-4 py-3 text-right">Battles</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.username}
                  className={`border-b border-border last:border-0 ${
                    r.username === user.username ? 'bg-accent/5' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {r.rank <= 3 ? <Trophy className="inline size-4 text-warning" /> : r.rank}
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/profile/${r.username}`} className="text-foreground hover:text-accent">
                      {r.username}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">{r.rating}</td>
                  <td className="px-4 py-3 text-right text-muted">{r.wins}</td>
                  <td className="px-4 py-3 text-right text-muted">{r.winRate}%</td>
                  <td className="px-4 py-3 text-right text-muted">{r.totalBattles}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </main>
  );
}

export default Leaderboard;
