import { useEffect, useState } from 'react';
import { getMyMatches } from './matchService';
import { summarizeMatches } from './battleState';
import MatchRow from './MatchRow';
import { formatSigned } from '../../shared/format';
import PageHeader, { EmptyState, ErrorNote } from '../../shared/ui/PageHeader';
import { ButtonLink } from '../../shared/ui/Button';
import { PageSpinner } from '../../shared/ui/Spinner';

function MatchHistoryPage() {
  const [matches, setMatches] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyMatches()
      .then((res) => setMatches(res.data.matches))
      .catch(() => setError('Could not load your match history. Refresh to try again.'));
  }, []);

  const summary = matches ? summarizeMatches(matches) : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        title="History"
        aside={
          summary &&
          summary.played > 0 && (
            <p className="font-tight text-3xl font-black">
              <span className="text-p1">{summary.wins}</span>
              <span className="text-muted">-</span>
              <span className="text-p2">{summary.losses}</span>
              {summary.draws > 0 && (
                <>
                  <span className="text-muted">-</span>
                  <span className="text-muted">{summary.draws}</span>
                </>
              )}
              <span className="ml-3 text-lg text-muted">{formatSigned(summary.ratingChange)}</span>
            </p>
          )
        }
      >
        Your last {matches?.length ?? ''} completed battles, newest first.
      </PageHeader>

      <div className="mt-6">
        {error && <ErrorNote>{error}</ErrorNote>}
        {!matches && !error && <PageSpinner label="Loading matches" />}
        {matches?.length === 0 && (
          <EmptyState title="No battles yet" action={<ButtonLink to="/battle">Find a match</ButtonLink>}>
            Finished battles show up here with the rating change from each one.
          </EmptyState>
        )}
        {matches?.length > 0 && (
          <ul className="flex flex-col gap-px border border-rule bg-rule">
            {matches.map((m) => (
              <MatchRow key={m.matchId} match={m} detailed />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

export default MatchHistoryPage;
