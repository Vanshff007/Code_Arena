import { TrendingUp, Trophy, Skull, Swords, Play, Dumbbell, ListChecks, BarChart3, History } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const stats = [
  { key: 'rating', label: 'Rating', icon: TrendingUp },
  { key: 'wins', label: 'Wins', icon: Trophy },
  { key: 'losses', label: 'Losses', icon: Skull },
  { key: 'totalBattles', label: 'Battles', icon: Swords },
];

// Every quick action leads to a page built in a later step (Battle system,
// Practice mode, Problem list, Leaderboard) - shown here per the design spec
// as inert "coming soon" cards rather than links to routes that don't exist yet.
const quickActions = [
  { label: 'Start Battle', icon: Play },
  { label: 'Practice', icon: Dumbbell },
  { label: 'Problems', icon: ListChecks },
  { label: 'Leaderboard', icon: BarChart3 },
];

function Dashboard() {
  const { user, logout } = useAuth();

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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {quickActions.map(({ label, icon: Icon }) => (
          <button
            key={label}
            disabled
            className="group flex cursor-not-allowed flex-col items-center gap-2 rounded-xl border border-border
              bg-card p-5 text-center opacity-60"
          >
            <Icon className="size-5 text-muted" />
            <span className="text-sm font-medium text-foreground">{label}</span>
            <Badge tone="muted">Soon</Badge>
          </button>
        ))}
      </div>

      <h2 className="mt-10 mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Recent matches</h2>
      <Card className="flex flex-col items-center gap-2 py-12 text-center">
        <History className="size-6 text-muted" />
        <p className="text-sm font-medium text-foreground">No matches yet</p>
        <p className="text-sm text-muted">Your battle history will show up here once you play.</p>
      </Card>
    </main>
  );
}

export default Dashboard;
