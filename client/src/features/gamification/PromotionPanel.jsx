import { formatNumber, formatSigned } from '../../shared/format';
import { tierFor, tierChange, nextTier, TIER_ORDER, TIER_TEXT, TIER_BG } from '../../shared/tier';

// Shown on the battle result when the rating change crossed a tier line.
// Promotion is the big moment; a drop is one quiet line.
function PromotionPanel({ ratingBefore, ratingAfter }) {
  const change = tierChange(ratingBefore, ratingAfter);
  if (!change) return null;
  const tier = tierFor(ratingAfter);

  if (change === 'down') {
    return <p className="mt-6 text-sm text-muted">You dropped to {tier}. One win can bring it back.</p>;
  }

  const next = nextTier(ratingAfter);
  const reached = TIER_ORDER.indexOf(tier);
  return (
    <section aria-label="Tier promotion" className="mt-10 border border-rule bg-panel p-6">
      <p className="text-sm text-muted">You moved up</p>
      <p className={`font-wide text-5xl font-black leading-none sm:text-6xl ${TIER_TEXT[tier]}`}>{tier}</p>
      <p className="mt-4 flex flex-wrap items-baseline gap-x-3">
        <span className="font-tight text-3xl font-black">{formatNumber(ratingAfter)}</span>
        <span className="font-tight text-lg font-bold text-ok">{formatSigned(ratingAfter - ratingBefore)}</span>
        {next && <span className="text-sm text-muted">{formatNumber(next.pointsToGo)} to {next.name}</span>}
      </p>
      <ol className="mt-5 grid grid-cols-5 gap-1">
        {TIER_ORDER.map((name, i) => (
          <li key={name}>
            <div className={`h-2.5 ${i <= reached ? TIER_BG[name] : 'bg-sunk'}`} />
            <span className={`mt-2 block text-xs ${i === reached ? `font-bold ${TIER_TEXT[name]}` : 'text-muted'}`}>{name}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default PromotionPanel;
