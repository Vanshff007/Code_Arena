import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { getLeetCodeRecommendations } from './leetcodeService';
import { recommendationState } from './leetcode';
import { useAuth } from '../auth/useAuth';
import { SectionTitle, EmptyState, ErrorNote } from '../../shared/ui/PageHeader';
import { ButtonLink } from '../../shared/ui/Button';
import Spinner from '../../shared/ui/Spinner';

// "Practice on LeetCode": problems picked from the topics the player has
// been solving on LeetCode lately and their weakest topic. They open on
// leetcode.com - LeetCode problems are linked, never copied here.
function LeetCodePractice() {
  const { user } = useAuth();
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    getLeetCodeRecommendations()
      .then((res) => setState({ status: 'ready', topics: res.data.topics }))
      .catch((err) => setState(recommendationState(err)));
  }, []);

  return (
    <section>
      <SectionTitle>Practice on LeetCode</SectionTitle>

      {state.status === 'loading' && <Spinner className="size-5 text-muted" />}

      {state.status === 'not-connected' && (
        <EmptyState
          title="Link your LeetCode account"
          action={
            <ButtonLink to={`/profile/${user.username}`} variant="secondary">
              Connect on your profile
            </ButtonLink>
          }
        >
          We'll suggest LeetCode problems in the topics you're working on there, skipping ones you just solved.
        </EmptyState>
      )}

      {state.status === 'error' && <ErrorNote>{state.message}</ErrorNote>}

      {state.status === 'ready' && (
        <div className="grid gap-8 lg:grid-cols-3">
          {state.topics.map((t) => (
            <div key={t.topic}>
              <div className="flex items-baseline justify-between gap-3 border-b border-ink pb-2">
                <h3 className="font-bold">{t.topic}</h3>
                <span className="text-sm text-muted">{t.difficulty}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{t.reason}</p>
              {t.problems.length === 0 ? (
                <p className="mt-3 text-sm text-muted">No new free problems found for this topic.</p>
              ) : (
                <ul className="mt-2 divide-y divide-rule">
                  {t.problems.map((p) => (
                    <li key={p.slug}>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center justify-between gap-3 py-2.5"
                      >
                        <span className="min-w-0 truncate font-medium group-hover:text-p1">{p.title}</span>
                        <span className="flex shrink-0 items-center gap-2 text-sm text-muted">
                          <span title="Acceptance rate on LeetCode">{p.acceptance}%</span>
                          <ExternalLink aria-hidden className="size-3.5" />
                          <span className="sr-only">(opens leetcode.com)</span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
      {state.status === 'ready' && (
        <p className="mt-4 text-xs text-muted">
          Problems open on leetcode.com. Sync your profile after solving to refresh these picks.{' '}
          <Link to={`/profile/${user.username}`} className="font-semibold text-p1 hover:underline">
            Sync now
          </Link>
        </p>
      )}
    </section>
  );
}

export default LeetCodePractice;
