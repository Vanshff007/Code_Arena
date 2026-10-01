import { formatDate, formatNumber } from '../../shared/format';
import { ratingChart, barPercent } from './leetcode';

const CHART_W = 280;
const CHART_H = 64;

function ContestChart({ history }) {
  const chart = ratingChart(history.map((c) => c.rating), CHART_W, CHART_H);
  const last = history.at(-1);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-bold">Contest rating</h3>
        <span className="font-tight text-2xl font-black text-p1">{formatNumber(last.rating)}</span>
      </div>
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="mt-2 h-16 w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Rating over the last ${history.length} contests, from ${history[0].rating} to ${last.rating}`}
      >
        <polyline points={chart.points} fill="none" stroke="var(--color-p1)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {chart.last && <rect x={chart.last.x - 3} y={chart.last.y - 3} width="6" height="6" fill="var(--color-p1)" />}
      </svg>
      <p className="mt-1 text-xs text-muted">
        {history.length} contest{history.length === 1 ? '' : 's'}, latest {last.title}
        {last.date && `, ${formatDate(last.date)}`}
      </p>
    </div>
  );
}

// Extra public data from a synced LeetCode profile: strongest topics,
// languages, activity and contest rating. Each block only shows when there
// is data for it.
function LeetCodeDetails({ leetcode }) {
  const { topTopics = [], languages = [], activity, contestHistory = [] } = leetcode;
  if (!topTopics.length && !languages.length && !activity && !contestHistory.length) return null;
  const maxTopic = topTopics[0]?.solved ?? 0;

  return (
    <div className="mt-6 flex flex-col gap-6 border-t border-rule pt-5">
      {activity && (
        <dl className="grid grid-cols-3 gap-4">
          {[
            ['Streak', `${activity.streak}d`],
            ['Active days', formatNumber(activity.totalActiveDays)],
            ['Last 30 days', formatNumber(activity.last30Days)],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="font-tight text-2xl font-black">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {topTopics.length > 0 && (
        <div>
          <h3 className="text-sm font-bold">Most solved topics</h3>
          <ul className="mt-2 space-y-2">
            {topTopics.map((t) => (
              <li key={t.topic}>
                <div className="flex items-baseline justify-between text-sm">
                  <span>{t.topic}</span>
                  <span className="font-tight font-bold">{formatNumber(t.solved)}</span>
                </div>
                <div className="mt-1 h-1.5 bg-sunk">
                  <div className="h-full bg-ink" style={{ width: `${barPercent(t.solved, maxTopic)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {languages.length > 0 && (
        <div>
          <h3 className="text-sm font-bold">Languages</h3>
          <p className="mt-1 text-sm text-muted">
            {languages.slice(0, 4).map((l) => `${l.name} ${formatNumber(l.solved)}`).join(', ')}
          </p>
        </div>
      )}

      {contestHistory.length > 0 && <ContestChart history={contestHistory} />}
    </div>
  );
}

export default LeetCodeDetails;
