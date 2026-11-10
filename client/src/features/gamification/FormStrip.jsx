import { formLabel, streakLabel } from './form';

// A player's last results under their name in the versus bar, oldest
// first: a win is filled in that player's color, a loss hollow, a draw
// grey. Each side keeps its own color, so cobalt still only means you.
function FormStrip({ name, form = [], streak = 0, side }) {
  if (!form.length) return null;
  const win = side === 'you' ? 'bg-p1' : 'bg-p2';
  const style = { W: win, L: 'border border-rule bg-panel', D: 'bg-muted/40' };
  const label = streakLabel(streak);
  return (
    <div className={`flex items-center gap-2 ${side === 'you' ? '' : 'flex-row-reverse'}`}>
      <div role="img" aria-label={formLabel(name, form)} className="flex gap-[3px]">
        {form.map((r, i) => (
          <span key={i} className={`size-2.5 ${style[r]}`} />
        ))}
      </div>
      {label && <span className="text-xs font-semibold text-ink">{label}</span>}
    </div>
  );
}

export default FormStrip;
