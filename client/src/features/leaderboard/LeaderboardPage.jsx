import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLeaderboard } from './leaderboardService';
import { ratingBarPercent, gapToNext } from './ladder';
import { useAuth } from '../auth/useAuth';
import { formatNumber } from '../../shared/format';
import PageHeader, { EmptyState, ErrorNote } from '../../shared/ui/PageHeader';
import { PageSpinner } from '../../shared/ui/Spinner';

function LeaderboardPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getLeaderboard()
      .then((res) => setRows(res.data.leaderboard))
      .catch(() => setError('Could not load the rankings. Refresh to try again.'));
  }, []);

  const gap = rows ? gapToNext(rows, user.username) : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Rankings"
        aside={
          gap && (
            <p className="text-sm text-muted sm:text-right">
              <span className="font-tight text-3xl font-black text-p1">{gap.points}</span> points behind
              <br />#{gap.rank} {gap.username}
            </p>
          )
        }
      >
        Everyone ranked by rating. Beat a higher-rated player to climb faster.
      </PageHeader>

      <div className="mt-6">
        {error && <ErrorNote>{error}</ErrorNote>}
        {!rows && !error && <PageSpinner label="Loading rankings" />}
        {rows?.length === 0 && <EmptyState title="No ranked players yet">Play a battle to appear here.</EmptyState>}

        {rows?.length > 0 && (
          <ol className="flex flex-col">
            {rows.map((r) => {
              const isYou = r.username === user.username;
              return (
                <li
                  key={r.username}
                  className={`grid grid-cols-[3rem_1fr_auto] items-center gap-x-4 border-b border-rule py-3 sm:grid-cols-[4rem_12rem_1fr_6rem_5rem] ${
                    isYou ? 'bg-p1/5 shadow-[inset_4px_0_0_var(--color-p1)]' : ''
                  }`}
                >
                  <span
                    className={`pl-3 font-tight text-3xl font-black ${r.rank <= 3 ? 'text-ink' : 'text-muted'}`}
                    aria-label={`Rank ${r.rank}`}
                  >
                    {r.rank}
                  </span>
                  <Link
                    to={`/profile/${r.username}`}
                    className={`truncate font-semibold hover:underline ${isYou ? 'text-p1' : 'text-ink'}`}
                  >
                    {r.username}
                    {isYou && <span className="ml-2 text-sm font-normal text-muted">(you)</span>}
                  </Link>
                  <span aria-hidden className="col-span-2 col-start-2 row-start-2 mt-2 pr-3 sm:col-span-1 sm:col-start-3 sm:row-start-1 sm:mt-0 sm:pr-0">
                    <span className="block h-2 bg-sunk">
                      <span
                        className={`block h-full ${isYou ? 'bg-p1' : 'bg-ink/70'}`}
                        style={{ width: `${ratingBarPercent(r.rating, rows)}%` }}
                      />
                    </span>
                  </span>
                  <span className="pr-3 text-right font-tight text-2xl font-black sm:pr-0">{formatNumber(r.rating)}</span>
                  <span className="hidden pr-3 text-right text-sm text-muted sm:block">
                    {r.wins}W {r.winRate}%
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </main>
  );
}

export default LeaderboardPage;
