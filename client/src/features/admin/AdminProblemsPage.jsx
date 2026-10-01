import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listProblems, deleteProblem } from './adminService';
import DifficultyMeter from '../problems/DifficultyMeter';
import { getErrorMessage } from '../../shared/getErrorMessage';
import { formatDate } from '../../shared/format';
import PageHeader, { EmptyState, ErrorNote } from '../../shared/ui/PageHeader';
import { ButtonLink } from '../../shared/ui/Button';
import { PageSpinner } from '../../shared/ui/Spinner';

// Admin: every problem, with edit and delete. Only reachable by admins
// (AdminRoute here, isAdmin on the server).
function AdminProblemsPage() {
  const [problems, setProblems] = useState(null);
  const [error, setError] = useState('');

  const load = () =>
    listProblems()
      .then((res) => setProblems(res.data.problems))
      .catch(() => setError('Could not load problems.'));

  useEffect(() => {
    load();
  }, []);

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.title}"? Players lose access to it; past battles keep their record.`)) return;
    try {
      await deleteProblem(p._id);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader title="Problems" aside={<ButtonLink to="/admin/problems/new">New problem</ButtonLink>}>
        Every change to test cases is checked against a reference solution before it is saved.
      </PageHeader>
      <div className="mt-6">
        {error && <ErrorNote>{error}</ErrorNote>}
        {!problems && !error && <PageSpinner label="Loading problems" />}
        {problems?.length === 0 && <EmptyState title="No problems yet" action={<ButtonLink to="/admin/problems/new">Add the first one</ButtonLink>} />}
        {problems?.length > 0 && (
          <ul className="divide-y divide-rule border-y border-rule">
            {problems.map((p) => (
              <li key={p._id} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-1 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{p.title}</span>
                  <span className="block truncate text-sm text-muted">{p.tags?.join(', ')}</span>
                </span>
                <DifficultyMeter difficulty={p.difficulty} />
                <span className="text-sm text-muted">{formatDate(p.createdAt)}</span>
                <Link to={`/admin/problems/${p._id}/edit`} className="text-sm font-semibold text-p1 hover:underline">
                  Edit
                </Link>
                <button onClick={() => remove(p)} className="text-sm font-semibold text-p2 hover:underline">
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

export default AdminProblemsPage;
