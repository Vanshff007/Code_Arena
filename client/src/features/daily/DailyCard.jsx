import { useEffect, useState } from 'react';
import { getDaily } from './dailyService';
import { streakText } from './daily';
import { ButtonLink } from '../../shared/ui/Button';
import { SectionTitle } from '../../shared/ui/PageHeader';
import Tag from '../../shared/ui/Tag';
import Spinner from '../../shared/ui/Spinner';

// Today's problem (the same for everyone, UTC day) and the player's streak.
function DailyCard() {
  const [daily, setDaily] = useState(undefined);

  useEffect(() => {
    getDaily()
      .then((res) => setDaily(res.data))
      .catch(() => setDaily(null));
  }, []);

  if (daily === null) return null;

  return (
    <section>
      <SectionTitle>Daily problem</SectionTitle>
      {daily === undefined ? (
        <Spinner className="size-5 text-muted" />
      ) : (
        <div className="border-y border-rule py-4">
          <p className="font-semibold">{daily.problem.title}</p>
          <p className="text-sm text-muted">
            {daily.problem.difficulty}, {streakText(daily.streak)}
          </p>
          <div className="mt-3">
            {daily.solvedToday ? (
              <Tag tone="ok">Solved today</Tag>
            ) : (
              <ButtonLink to={`/practice/${daily.problem._id}`} variant="secondary">
                Solve today's problem
              </ButtonLink>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default DailyCard;
