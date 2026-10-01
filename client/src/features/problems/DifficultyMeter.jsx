import { difficultyLevel } from './difficulty';

// Three ascending bars, filled up to the level - like a signal meter.
function DifficultyMeter({ difficulty, showLabel = true }) {
  const level = difficultyLevel(difficulty);
  return (
    <span className="inline-flex items-center gap-2 text-sm text-ink" title={difficulty}>
      <span aria-hidden className="flex items-end gap-[2px]">
        {[1, 2, 3].map((n) => (
          <span key={n} className={`w-1 ${n <= level ? 'bg-ink' : 'bg-rule'}`} style={{ height: 4 + n * 4 }} />
        ))}
      </span>
      {showLabel ? difficulty : <span className="sr-only">{difficulty}</span>}
    </span>
  );
}

export default DifficultyMeter;
