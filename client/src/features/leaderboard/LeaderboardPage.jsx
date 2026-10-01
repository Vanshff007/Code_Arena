import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLeaderboard, getSeasons, getSeasonLeaderboard } from './leaderboardService';
import { ratingBarPercent, gapToNext } from './ladder';
import { useAuth } from '../auth/useAuth';
import { formatNumber, formatSigned } from '../../shared/format';
import PageHeader, { EmptyState, ErrorNote } from '../../shared/ui/PageHeader';
import { PageSpinner } from '../../shared/ui/Spinner';

const VIEWS = [
  ['all', 'All time'],
  ['season', 'Seasons'],
];

function AllTimeLadder({ rows, username }) {
  return (
    <ol className="flex flex-col">
      {rows.map((r) => {
        const isYou = r.username === username;
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
  );
}

function SeasonLadder({ rows, username }) {
  return (
    <ol className="flex flex-col">
      {rows.map((r) => {
        const isYou = r.username === username;
        return (
          <li
            key={r.username}
            className={`grid grid-cols-[3rem_1fr_auto] items-center gap-x-4 border-b border-rule py-3 sm:grid-cols-[4rem_1fr_8rem_6rem] ${
              isYou ? 'bg-p1/5 shadow-[inset_4px_0_0_var(--color-p1)]' : ''
            }`}
          >
            <span className={`pl-3 font-tight text-3xl font-black ${r.rank <= 3 ? 'text-ink' : 'text-muted'}`} aria-label={`Rank ${r.rank}`}>
              {r.rank}
            </span>
            <Link to={`/profile/${r.username}`} className={`truncate font-semibold hover:underline ${isYou ? 'text-p1' : 'text-ink'}`}>
              {r.username}
              {isYou && <span className="ml-2 text-sm font-normal text-muted">(you)</span>}
            </Link>
            <span className={`pr-3 text-right font-tight text-2xl font-black sm:pr-0 ${r.points >= 0 ? 'text-ok' : 'text-p2'}`}>
              {formatSigned(r.points)}
            </span>
            <span className="hidden pr-3 text-right text-sm text-muted sm:block">
              {r.wins}W / {r.battles}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// All-time ranking by rating, and monthly seasons ranked by the rating
// points gained that month (ratings never reset).
function LeaderboardPage() {
  const { user } = useAuth();
  const [view, setView] = useState('all');
  const [rows, setRows] = useState(null);
  const [seasons, setSeasons] = useState(null);
  const [season, setSeason] = useState(null);
  const [seasonRows, setSeasonRows] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getLeaderboard()
      .then((res) => setRows(res.data.leaderboard))
      .catch(() => setError('Could not load the rankings. Refresh to try again.'));
  }, []);

  useEffect(() => {
    if (view !== 'season' || seasons) return;
    getSeasons()
      .then((res) => {
        setSeasons(res.data.seasons);
        setSeason(res.data.seasons.find((s) => s.current)?.id ?? res.data.seasons[0]?.id);
      })
      .catch(() => setError('Could not load seasons.'));
  }, [view, seasons]);

  useEffect(() => {
    if (!season) return;
    setSeasonRows(null);
    getSeasonLeaderboard(season)
      .then((res) => setSeasonRows(res.data.leaderboard))
      .catch(() => setError('Could not load this season.'));
  }, [season]);

  const gap = rows && view === 'all' ? gapToNext(rows, user.username) : null;

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
        {view === 'all'
          ? 'Everyone ranked by rating. Beat a higher-rated player to climb faster.'
          : 'Each month is a season, ranked by rating points gained that month. Your overall rating never resets.'}
      </PageHeader>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Ranking" className="flex border border-rule bg-panel p-0.5">
          {VIEWS.map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={view === id}
              onClick={() => setView(id)}
              className={`px-3 py-1.5 text-sm font-semibold ${view === id ? 'bg-ink text-paper' : 'text-muted hover:text-ink'}`}
            >
              {label}
            </button>
          ))}
        </div>
        {view === 'season' && seasons && (
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted">Season</span>
            <select
              value={season ?? ''}
              onChange={(e) => setSeason(e.target.value)}
              className="border border-rule bg-panel px-2 py-1.5 text-sm text-ink focus:border-p1 focus:outline-none"
            >
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                  {s.current ? ' (now)' : ''}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="mt-6">
        {error && <ErrorNote>{error}</ErrorNote>}
        {view === 'all' && (
          <>
            {!rows && !error && <PageSpinner label="Loading rankings" />}
            {rows?.length === 0 && <EmptyState title="No ranked players yet">Play a battle to appear here.</EmptyState>}
            {rows?.length > 0 && <AllTimeLadder rows={rows} username={user.username} />}
          </>
        )}
        {view === 'season' && (
          <>
            {!seasonRows && !error && <PageSpinner label="Loading season" />}
            {seasonRows?.length === 0 && (
              <EmptyState title="No battles this season yet">The first battle of the month puts its players on the board.</EmptyState>
            )}
            {seasonRows?.length > 0 && <SeasonLadder rows={seasonRows} username={user.username} />}
          </>
        )}
      </div>
    </main>
  );
}

export default LeaderboardPage;
