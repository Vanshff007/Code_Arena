const tones = {
  ok: 'text-ok',
  bad: 'text-p2',
  warn: 'text-warn',
  you: 'text-p1',
  muted: 'text-muted',
};

const marks = {
  ok: 'bg-ok',
  bad: 'bg-p2',
  warn: 'bg-warn',
  you: 'bg-p1',
  muted: 'bg-muted/50',
};

// A status word with a small square marker in its color - reads like a
// scoreboard legend instead of a pill badge.
function Tag({ tone = 'muted', children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${tones[tone]} ${className}`}>
      <span aria-hidden className={`size-2 shrink-0 ${marks[tone]}`} />
      {children}
    </span>
  );
}

export default Tag;
