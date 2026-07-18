import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TrendingUp, Trophy, Skull, Swords, Award } from 'lucide-react';
import { getProfileByUsername } from '../services/userService';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

const resultTone = { Win: 'success', Loss: 'error', Draw: 'muted' };

function Profile() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setData(null);
    setError('');
    getProfileByUsername(username)
      .then((res) => setData(res.data))
      .catch(() => setError('User not found.'));
  }, [username]);

  if (error) {
    return <main className="mx-auto max-w-md px-6 py-24 text-center text-error">{error}</main>;
  }

  if (!data) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <Spinner className="size-6 text-accent" />
      </div>
    );
  }

  const { user, recentMatches } = data;

  return (
    <main className="animate-fade-in mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{user.username}</h1>
          <p className="mt-1 text-sm text-muted">Rank #{user.rank} &middot; Member since {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="flex flex-col gap-2">
          <TrendingUp className="size-4.5 text-accent" />
          <p className="text-xs uppercase tracking-wide text-muted">Rating</p>
          <p className="text-xl font-bold text-foreground">{user.rating}</p>
        </Card>
        <Card className="flex flex-col gap-2">
          <Trophy className="size-4.5 text-accent" />
          <p className="text-xs uppercase tracking-wide text-muted">Wins</p>
          <p className="text-xl font-bold text-foreground">{user.wins}</p>
        </Card>
        <Card className="flex flex-col gap-2">
          <Skull className="size-4.5 text-accent" />
          <p className="text-xs uppercase tracking-wide text-muted">Losses</p>
          <p className="text-xl font-bold text-foreground">{user.losses}</p>
        </Card>
        <Card className="flex flex-col gap-2">
          <Swords className="size-4.5 text-accent" />
          <p className="text-xs uppercase tracking-wide text-muted">Win rate</p>
          <p className="text-xl font-bold text-foreground">{user.winRate}%</p>
        </Card>
      </div>

      {user.badges.length > 0 && (
        <>
          <h2 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Badges</h2>
          <div className="flex flex-wrap gap-2">
            {user.badges.map((b) => (
              <Badge key={b} tone="success">
                <Award className="size-3.5" />
                {b}
              </Badge>
            ))}
          </div>
        </>
      )}

      <h2 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Recent matches</h2>
      {recentMatches.length === 0 ? (
        <Card className="py-8 text-center text-sm text-muted">No matches yet.</Card>
      ) : (
        <div className="flex flex-col gap-2">
          {recentMatches.map((m, i) => (
            <Card key={i} className="flex items-center justify-between py-3">
              <span className="text-sm text-foreground">{m.problem}</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${m.ratingChange >= 0 ? 'text-success' : 'text-error'}`}>
                  {m.ratingChange >= 0 ? '+' : ''}
                  {m.ratingChange}
                </span>
                <Badge tone={resultTone[m.result]}>{m.result}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}

export default Profile;
