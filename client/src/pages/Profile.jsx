import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TrendingUp, Trophy, Skull, Swords, Award, Code2, RefreshCw, Unlink } from 'lucide-react';
import { getProfileByUsername } from '../services/userService';
import { connectLeetCode, disconnectLeetCode, syncLeetCode } from '../services/leetcodeService';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/getErrorMessage';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const resultTone = { Win: 'success', Loss: 'error', Draw: 'muted' };

function Profile() {
  const { username } = useParams();
  const { user: authUser } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const [leetcodeInput, setLeetcodeInput] = useState('');
  const [leetcodeBusy, setLeetcodeBusy] = useState(false);
  const [leetcodeError, setLeetcodeError] = useState('');

  const isOwnProfile = authUser.username === username;

  const load = () => {
    setError('');
    getProfileByUsername(username)
      .then((res) => setData(res.data))
      .catch(() => setError('User not found.'));
  };

  useEffect(() => {
    setData(null);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!leetcodeInput.trim()) return;
    setLeetcodeBusy(true);
    setLeetcodeError('');
    try {
      await connectLeetCode(leetcodeInput.trim());
      await syncLeetCode();
      setLeetcodeInput('');
      load();
    } catch (err) {
      setLeetcodeError(getErrorMessage(err, 'Failed to connect LeetCode account.'));
    } finally {
      setLeetcodeBusy(false);
    }
  };

  const handleSync = async () => {
    setLeetcodeBusy(true);
    setLeetcodeError('');
    try {
      await syncLeetCode();
      load();
    } catch (err) {
      setLeetcodeError(getErrorMessage(err, 'Sync failed - LeetCode may be unreachable right now.'));
    } finally {
      setLeetcodeBusy(false);
    }
  };

  const handleDisconnect = async () => {
    setLeetcodeBusy(true);
    setLeetcodeError('');
    try {
      await disconnectLeetCode();
      load();
    } finally {
      setLeetcodeBusy(false);
    }
  };

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
          <p className="mt-1 text-sm text-muted">
            Rank #{user.rank} &middot; Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>
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

      <h2 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wide text-muted">LeetCode</h2>
      <Card className="flex flex-col gap-3">
        {user.leetcode.username ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="size-4.5 text-accent" />
                <span className="font-medium text-foreground">{user.leetcode.username}</span>
              </div>
              {isOwnProfile && (
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={handleSync} loading={leetcodeBusy}>
                    <RefreshCw className="size-4" />
                    Sync
                  </Button>
                  <Button variant="ghost" onClick={handleDisconnect} loading={leetcodeBusy}>
                    <Unlink className="size-4" />
                    Disconnect
                  </Button>
                </div>
              )}
            </div>
            {user.leetcode.stats && (
              <div className="grid grid-cols-3 gap-3 text-center sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted">Solved</p>
                  <p className="font-semibold text-foreground">{user.leetcode.stats.totalSolved}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Easy</p>
                  <p className="font-semibold text-success">{user.leetcode.stats.easySolved}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Medium</p>
                  <p className="font-semibold text-warning">{user.leetcode.stats.mediumSolved}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Hard</p>
                  <p className="font-semibold text-error">{user.leetcode.stats.hardSolved}</p>
                </div>
              </div>
            )}
            {user.leetcode.lastSyncedAt && (
              <p className="text-xs text-muted">
                Last synced {new Date(user.leetcode.lastSyncedAt).toLocaleString()}
              </p>
            )}
          </>
        ) : isOwnProfile ? (
          <form onSubmit={handleConnect} className="flex gap-2">
            <input
              value={leetcodeInput}
              onChange={(e) => setLeetcodeInput(e.target.value)}
              placeholder="Your LeetCode username"
              className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
            />
            <Button type="submit" loading={leetcodeBusy}>
              Connect
            </Button>
          </form>
        ) : (
          <p className="text-sm text-muted">No LeetCode account connected.</p>
        )}
        {leetcodeError && <p className="text-sm text-error">{leetcodeError}</p>}
      </Card>

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
