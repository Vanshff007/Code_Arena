import { useAuth } from '../hooks/useAuth';

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 text-center dark:border-gray-800">
      <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">{value}</dd>
    </div>
  );
}

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Welcome, {user.username}
        </h1>
        <button
          onClick={logout}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Logout
        </button>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Rating" value={user.rating} />
        <Stat label="Wins" value={user.wins} />
        <Stat label="Losses" value={user.losses} />
        <Stat label="Battles" value={user.totalBattles} />
      </dl>

      <p className="mt-10 text-sm text-gray-500 dark:text-gray-400">
        Start Battle, Join Battle, Practice Mode, Leaderboard, and Match History land in later
        steps.
      </p>
    </main>
  );
}

export default Dashboard;
