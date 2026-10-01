import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProblemById } from './problemService';
import ProblemStatement from './ProblemStatement';
import EditorialPanel from './EditorialPanel';
import CodeWorkspace from '../execution/CodeWorkspace';
import { ErrorNote } from '../../shared/ui/PageHeader';
import { PageSpinner } from '../../shared/ui/Spinner';

function ProblemSolvePage() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loadError, setLoadError] = useState('');

  // Captured once the problem loads - lets the backend compute "time taken"
  // for the Skill Analyzer / AI Coach without any server-side session state.
  const startedAtRef = useRef(Date.now());

  useEffect(() => {
    setProblem(null);
    getProblemById(id)
      .then((res) => {
        setProblem(res.data.problem);
        startedAtRef.current = Date.now();
      })
      .catch(() => setLoadError('This problem could not be loaded. It may have been removed.'));
  }, [id]);

  if (loadError) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <ErrorNote>{loadError}</ErrorNote>
        <Link to="/problems" className="mt-4 inline-block text-sm font-semibold text-p1 hover:underline">
          Back to practice
        </Link>
      </main>
    );
  }

  if (!problem) return <PageSpinner label="Loading problem" />;

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div className="lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-4">
        <Link to="/problems" className="mb-4 inline-block text-sm text-muted hover:text-ink">
          Practice
        </Link>
        <ProblemStatement problem={problem} />
        <div className="mt-8">
          <EditorialPanel problemId={id} warn />
        </div>
      </div>
      <CodeWorkspace problem={problem} submitExtras={() => ({ startedAt: startedAtRef.current })} />
    </main>
  );
}

export default ProblemSolvePage;
