import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TrendingUp,
  Trophy,
  Skull,
  Swords,
  Play,
  Dumbbell,
  ListChecks,
  BarChart3,
  History,
  User,
  Radar,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getProblems } from '../services/problemService';
import { getMyMatches } from '../services/matchService';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

const stats = [
  { key: 'rating', label: 'Rating', icon: TrendingUp },
  { key: 'wins', label: 'Wins', icon: Trophy },
  { key: 'losses', label: 'Losses', icon: Skull },
  { key: 'totalBattles', label: 'Battles', icon: Swords },
];

const resultTone = { Win: 'success', Loss: 'error', Draw: 'muted' };

function Dashboard() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [recentMatches, setRecentMatches] = useState(null);

  // Rating/wins/losses in AuthContext are only as fresh as the last
  // login/register - refetch every time the dashboard is opened (e.g.
  // right after a battle ends) so the stat cards aren't stale.
  useEffect(() => {
    refreshUser();
    getMyMatches()
      .then((res) => setRecentMatches(res.data.matches.slice(0, 5)))
      .catch(() => setRecentMatches([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // "Practice" jumps straight into a random problem; "Problems" browses
  // the full list - otherwise the two quick actions would be identical.
  const handlePractice = async () => {
    const res = await getProblems();
    const problems = res.data.problems;
    if (problems.length === 0) return navigate('/problems');
    const random = problems[Math.floor(Math.random() * problems.length)];
    navigate(`/practice/${random._id}`);
  };

  const quickActions = [
    { label: 'Start Battle', icon: Play, onClick: () => navigate('/battle') },
    { label: 'Practice', icon: Dumbbell, onClick: handlePractice },
    { label: 'Problems', icon: ListChecks, onClick: () => navigate('/problems') },
    { label: 'Leaderboard', icon: BarChart3, onClick: () => navigate('/leaderboard') },
    { label: 'Match History', icon: History, onClick: () => navigate('/history') },
    { label: 'Profile', icon: User, onClick: () => navigate(`/profile/${user.username}`) },
    { label: 'Skill Dashboard', icon: Radar, onClick: () => navigate('/skills') },
  ];

  return (
    <main className="animate-fade-in mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome, {user.username}</h1>
          <p className="mt-1 text-sm text-muted">Here's where your battles stand.</p>
        </div>
        <button
          onClick={logout}
          className="rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-foreground"
        >
          Logout
        </button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(({ key, label, icon: Icon }) => (
          <Card key={key} hover className="flex flex-col gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-accent/10">
              <Icon className="size-4.5 text-accent" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
              <p className="mt-0.5 text-2xl font-bold text-foreground">{user[key]}</p>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="mt-10 mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Quick actions</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {quickActions.map(({ label, icon: Icon, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5
              text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg"
          >
            <Icon className="size-5 text-accent" />
            <span className="text-sm font-medium text-foreground">{label}</span>
          </button>
        ))}
      </div>

      <h2 className="mt-10 mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Recent matches</h2>
      {recentMatches === null ? (
        <div className="flex justify-center py-8">
          <Spinner className="size-5 text-accent" />
        </div>
      ) : recentMatches.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-12 text-center">
          <History className="size-6 text-muted" />
          <p className="text-sm font-medium text-foreground">No matches yet</p>
          <p className="text-sm text-muted">Your battle history will show up here once you play.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {recentMatches.map((m) => (
            <Card key={m.matchId} className="flex items-center justify-between">
              <span className="text-sm text-foreground">
                vs {m.opponent} &middot; {m.problem}
              </span>
              <Badge tone={resultTone[m.result]}>{m.result}</Badge>
            </Card>
          ))}
          <Link to="/history" className="text-center text-sm text-accent hover:underline">
            View all matches
          </Link>
        </div>
      )}
    </main>
  );
}

export default Dashboard;
