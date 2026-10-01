import { Link } from 'react-router-dom';
import { formatDate, formatSigned } from '../../shared/format';
import { LANGUAGES } from '../execution/languages';

const languageLabel = (id) => LANGUAGES.find((l) => l.id === id)?.label ?? id;

const RESULT_STYLE = {
  Win: { bar: 'bg-p1', text: 'text-p1' },
  Loss: { bar: 'bg-p2', text: 'text-p2' },
  Draw: { bar: 'bg-muted/40', text: 'text-muted' },
};

// One finished match. Result word and edge bar use the duel colors: a win
// is yours (cobalt), a loss went to the other side (crimson).
function MatchRow({ match, detailed = false }) {
  const style = RESULT_STYLE[match.result] ?? RESULT_STYLE.Draw;
  return (
    <li className="flex items-stretch gap-4 bg-panel">
      <span aria-hidden className={`w-1 shrink-0 ${style.bar}`} />
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-6 gap-y-1 py-3 pr-4">
        <span className={`w-12 font-bold ${style.text}`}>{match.result}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-ink">vs {match.opponent}</span>
          <span className="block truncate text-sm text-muted">
            {match.problem}
            {detailed && match.language && `, ${languageLabel(match.language)}`}
          </span>
        </span>
        {detailed && match.endedAt && <span className="text-sm text-muted">{formatDate(match.endedAt)}</span>}
        {detailed && match.hasReplay && (
          <Link to={`/replay/${match.matchId}`} className="text-sm font-semibold text-p1 hover:underline">
            Replay
          </Link>
        )}
        <span
          className={`w-14 text-right font-tight text-lg font-bold ${match.ratingChange >= 0 ? 'text-ok' : 'text-p2'}`}
        >
          {formatSigned(match.ratingChange)}
        </span>
      </div>
    </li>
  );
}

export default MatchRow;
