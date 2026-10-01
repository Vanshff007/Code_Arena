// Test cases as a row of squares: passed ones filled, the rest hollow.
// Used in the verdict panel and the battle versus bar, so "how close is
// each player" reads the same way everywhere.
function Pips({ passed = 0, total = 0, color = 'bg-ok', align = 'start', max = 20, label }) {
  if (!total) return null;
  const shown = Math.min(total, max);
  // When there are more cases than squares, scale the filled count.
  const filled = Math.round((passed / total) * shown);

  return (
    <div
      role="img"
      aria-label={label ?? `${passed} of ${total} test cases passed`}
      className={`flex flex-wrap gap-[3px] ${align === 'end' ? 'flex-row-reverse' : ''}`}
    >
      {Array.from({ length: shown }, (_, i) => (
        <span key={i} className={`h-3 w-2 ${i < filled ? color : 'border border-rule bg-panel'}`} />
      ))}
    </div>
  );
}

export default Pips;
