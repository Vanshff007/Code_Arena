import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProblems } from '../services/problemService';
import { DIFFICULTY_TONE } from '../utils/starterCode';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

function Problems() {
  const [problems, setProblems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getProblems()
      .then((res) => setProblems(res.data.problems))
      .catch(() => setError('Failed to load problems.'));
  }, []);

  return (
    <main className="animate-fade-in mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground">Problems</h1>
      <p className="mt-1 text-sm text-muted">Practice at your own pace.</p>

      <div className="mt-6 flex flex-col gap-3">
        {!problems && !error && (
          <div className="flex justify-center py-12">
            <Spinner className="size-6 text-accent" />
          </div>
        )}

        {error && <p className="text-sm text-error">{error}</p>}

        {problems?.length === 0 && (
          <Card className="py-12 text-center text-sm text-muted">
            No problems yet. Check back soon.
          </Card>
        )}

        {problems?.map((p) => (
          <Link key={p._id} to={`/practice/${p._id}`}>
            <Card hover className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{p.title}</p>
                {p.tags?.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <Badge key={t} tone="muted">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <Badge tone={DIFFICULTY_TONE[p.difficulty]}>{p.difficulty}</Badge>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}

export default Problems;
