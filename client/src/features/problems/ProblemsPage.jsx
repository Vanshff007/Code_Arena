import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { getProblems } from './problemService';
import { DIFFICULTIES, filterProblems } from './difficulty';
import DifficultyMeter from './DifficultyMeter';
import PageHeader, { EmptyState, ErrorNote } from '../../shared/ui/PageHeader';
import { PageSpinner } from '../../shared/ui/Spinner';

const FILTERS = ['All', ...DIFFICULTIES];

function ProblemsPage() {
  const [problems, setProblems] = useState(null);
  const [error, setError] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [query, setQuery] = useState('');

  useEffect(() => {
    getProblems()
      .then((res) => setProblems(res.data.problems))
      .catch(() => setError('Could not load problems. Check your connection and refresh.'));
  }, []);

  const visible = useMemo(() => filterProblems(problems || [], { difficulty, query }), [problems, difficulty, query]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader title="Practice">
        Solve at your own pace. Practice runs on the same judge as battles and feeds your skill profile.
      </PageHeader>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="radiogroup" aria-label="Difficulty" className="flex border border-rule bg-panel p-0.5 self-start">
          {FILTERS.map((f) => (
            <button
              key={f}
              role="radio"
              aria-checked={difficulty === f}
              onClick={() => setDifficulty(f)}
              className={`px-3 py-1.5 text-sm font-semibold ${difficulty === f ? 'bg-ink text-white' : 'text-muted hover:text-ink'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <label className="relative sm:w-72">
          <span className="sr-only">Search problems</span>
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or topic"
            className="w-full border border-rule bg-panel py-2 pl-9 pr-3 text-sm focus:border-p1 focus:outline-none"
          />
        </label>
      </div>

      <div className="mt-6">
        {error && <ErrorNote>{error}</ErrorNote>}
        {!problems && !error && <PageSpinner label="Loading problems" />}

        {problems?.length === 0 && (
          <EmptyState title="The problem bank is empty">
            An admin needs to add problems. Run <code className="font-mono">npm run seed-problems</code> on the server.
          </EmptyState>
        )}
        {problems?.length > 0 && visible.length === 0 && (
          <EmptyState title="No problems match">Clear the search or pick another difficulty.</EmptyState>
        )}

        {visible.length > 0 && (
          <ul className="divide-y divide-rule border-y border-rule">
            {visible.map((p) => (
              <li key={p._id}>
                <Link
                  to={`/practice/${p._id}`}
                  className="group grid grid-cols-[1fr_auto] items-center gap-4 px-1 py-4 hover:bg-panel sm:grid-cols-[1fr_14rem_7rem]"
                >
                  <span className="font-semibold text-ink group-hover:text-p1 break-words">{p.title}</span>
                  <span className="hidden truncate text-sm text-muted sm:block">{p.tags?.join(', ')}</span>
                  <DifficultyMeter difficulty={p.difficulty} />
                </Link>
              </li>
            ))}
          </ul>
        )}
        {problems?.length > 0 && (
          <p className="mt-3 text-sm text-muted">
            Showing {visible.length} of {problems.length}
          </p>
        )}
      </div>
    </main>
  );
}

export default ProblemsPage;
