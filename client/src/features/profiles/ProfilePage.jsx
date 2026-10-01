import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProfileByUsername } from './profileService';
import { useAuth } from '../auth/useAuth';
import LeetCodePanel from '../leetcode/LeetCodePanel';
import { formatDate, formatNumber, formatSigned } from '../../shared/format';
import { SectionTitle, EmptyState, ErrorNote } from '../../shared/ui/PageHeader';
import { PageSpinner } from '../../shared/ui/Spinner';

const RESULT_COLOR = { Win: 'text-p1', Loss: 'text-p2', Draw: 'text-muted' };

function ProfilePage() {
  const { username } = useParams();
  const { user: authUser } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const isOwner = authUser.username === username;

  const load = useCallback(() => {
    setError('');
    getProfileByUsername(username)
      .then((res) => setData(res.data))
      .catch(() => setError(`No player named "${username}".`));
  }, [username]);

  useEffect(() => {
    setData(null);
    load();
  }, [load]);

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <ErrorNote>{error}</ErrorNote>
      </main>
    );
  }
  if (!data) return <PageSpinner label="Loading profile" />;

  const { user, recentMatches } = data;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-6 border-b border-rule pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate font-wide text-5xl font-black leading-none tracking-tight">{user.username}</h1>
          <p className="mt-3 text-sm text-muted">
            Rank #{formatNumber(user.rank)}, playing since {formatDate(user.createdAt)}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-sm text-muted">Rating</p>
          <p className="font-tight text-7xl font-black leading-none text-p1">{formatNumber(user.rating)}</p>
        </div>
      </header>

      <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
        {[
          ['Battles', user.totalBattles],
          ['Wins', user.wins],
          ['Losses', user.losses],
          ['Win rate', `${user.winRate}%`],
        ].map(([label, value]) => (
          <div key={label} className="border-l border-rule pl-4">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="font-tight text-4xl font-black">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <SectionTitle>Badges</SectionTitle>
          {user.badges.length === 0 ? (
            <p className="text-sm text-muted">
              {isOwner ? 'Play your first battle to earn First Blood.' : 'No badges yet.'}
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {user.badges.map((b) => (
                <li key={b} className="border border-ink px-3 py-1.5 text-sm font-semibold">
                  {b}
                </li>
              ))}
            </ul>
          )}

          <SectionTitle>Recent battles</SectionTitle>
          {recentMatches.length === 0 ? (
            <EmptyState title="No battles yet" />
          ) : (
            <ul className="divide-y divide-rule border-y border-rule">
              {recentMatches.map((m, i) => (
                <li key={i} className="flex items-center gap-4 py-3">
                  <span className={`w-10 font-bold ${RESULT_COLOR[m.result]}`}>{m.result}</span>
                  <span className="min-w-0 flex-1 truncate">{m.problem}</span>
                  <span className={`font-tight text-lg font-bold ${m.ratingChange >= 0 ? 'text-ok' : 'text-p2'}`}>
                    {formatSigned(m.ratingChange)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <SectionTitle>Linked accounts</SectionTitle>
          <LeetCodePanel leetcode={user.leetcode} isOwner={isOwner} onChanged={load} />
        </div>
      </div>
    </main>
  );
}

export default ProfilePage;
