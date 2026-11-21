import { xpPercent } from '../skills/skills';

// Battle result: the arena XP lines this battle earned and the overall
// level bar after it. Hidden when the server sent no XP.
function ArenaXpPanel({ xp }) {
  if (!xp) return null;
  const { gained, items, overall } = xp;
  return (
    <section aria-label="Arena XP" className="mt-6 border border-rule bg-panel p-6">
      <p className="flex items-baseline justify-between gap-4">
        <span className="font-tight text-3xl font-black">+{gained} XP</span>
        <span className="text-sm text-muted">
          Level <span className="font-tight text-lg font-black text-ink">{overall.level}</span>
        </span>
      </p>
      <ul className="mt-3 space-y-1 text-sm">
        {items.map((i) => (
          <li key={i.key} className="flex justify-between gap-4">
            <span className="text-muted">{i.label}</span>
            <span className="font-semibold">+{i.xp}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 h-1.5 bg-sunk">
        <div className="h-full bg-ink" style={{ width: `${xpPercent(overall)}%` }} />
      </div>
      <p className="mt-1 text-xs text-muted">
        {overall.xpIntoLevel} of {overall.xpForNextLevel} XP to level {overall.level + 1}
      </p>
    </section>
  );
}

export default ArenaXpPanel;
