import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { getProblems } from '../problems/problemService';
import { getMyMatches } from '../battles/matchService';
import { getProfileByUsername } from '../profiles/profileService';
import MatchRow from '../battles/MatchRow';
import { pickRandom, winRate } from './dashboard';
import { formatNumber } from '../../shared/format';
import Button, { ButtonLink } from '../../shared/ui/Button';
import { SectionTitle, EmptyState } from '../../shared/ui/PageHeader';
import Spinner from '../../shared/ui/Spinner';

function Stat({ label, value, className = '' }) {
  return (
    <div className="border-l border-rule pl-4">
      <p className="text-sm text-muted">{label}</p>
      <p className={`font-tight text-4xl font-black leading-tight ${className}`}>{value}</p>
    </div>
  );
}

function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [recentMatches, setRecentMatches] = useState(null);
  const [rank, setRank] = useState(null);
  const [practiceBusy, setPracticeBusy] = useState(false);

  // Rating/wins/losses in AuthContext are only as fresh as the last
  // login/register - refetch every time the dashboard is opened (e.g.
  // right after a battle ends) so the numbers aren't stale.
  useEffect(() => {
    refreshUser().catch(() => {});
    getMyMatches()
      .then((res) => setRecentMatches(res.data.matches.slice(0, 5)))
      .catch(() => setRecentMatches([]));
    getProfileByUsername(user.username)
      .then((res) => setRank(res.data.user.rank))
      .catch(() => setRank(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePractice = async () => {
    setPracticeBusy(true);
    try {
      const res = await getProblems();
      const problem = pickRandom(res.data.problems);
      navigate(problem ? `/practice/${problem._id}` : '/problems');
    } finally {
      setPracticeBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <section className="grid gap-10 border-b border-rule pb-10 lg:grid-cols-[auto_1fr] lg:items-end">
        <div>
          <p className="text-[15px] text-muted">{user.username}, your rating is</p>
          <p className="font-tight text-[7rem] font-black leading-[0.85] text-p1 sm:text-[9rem]">
            {formatNumber(user.rating)}
          </p>
        </div>
        <div className="flex flex-col gap-8 lg:items-end">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <Stat label="Rank" value={rank ? `#${formatNumber(rank)}` : '-'} />
            <Stat label="Wins" value={user.wins} />
            <Stat label="Losses" value={user.losses} />
            <Stat label="Win rate" value={`${winRate(user)}%`} />
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink to="/battle" className="px-6 py-3 text-base">
              Find a match
            </ButtonLink>
            <Button variant="secondary" onClick={handlePractice} loading={practiceBusy} className="px-6 py-3 text-base">
              Practice a random problem
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
        <section>
          <SectionTitle
            aside={
              recentMatches?.length > 0 && (
                <Link to="/history" className="text-sm font-semibold text-p1 hover:underline">
                  All matches
                </Link>
              )
            }
          >
            Recent battles
          </SectionTitle>
          {recentMatches === null && <Spinner className="size-5 text-muted" />}
          {recentMatches?.length === 0 && (
            <EmptyState title="No battles yet">
              Your first match sets the tone. Quick match pairs you with the next player in the queue.
            </EmptyState>
          )}
          {recentMatches?.length > 0 && (
            <ul className="flex flex-col gap-px border border-rule bg-rule">
              {recentMatches.map((m) => (
                <MatchRow key={m.matchId} match={m} />
              ))}
            </ul>
          )}
        </section>

        <section>
          <SectionTitle>Keep improving</SectionTitle>
          <ul className="divide-y divide-rule border-y border-rule">
            {[
              ['/skills', 'Skill profile', 'Strong and weak topics, with problems picked for you.'],
              ['/leaderboard', 'Rankings', 'See who is above you and by how much.'],
              [`/profile/${user.username}`, 'Your profile', 'Badges, public stats and LeetCode link.'],
            ].map(([to, title, text]) => (
              <li key={to}>
                <Link to={to} className="group block py-4">
                  <span className="font-semibold group-hover:text-p1">{title}</span>
                  <span className="block text-sm text-muted">{text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

export default DashboardPage;
