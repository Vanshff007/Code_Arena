// Hand-rolled SVG radar chart - no charting library needed for one simple
// polygon-on-axes plot, keeping the dependency list minimal.
const SIZE = 320;
const CENTER = SIZE / 2;
const MAX_RADIUS = SIZE / 2 - 50; // leaves room for topic labels around the edge
const GRID_LEVELS = [25, 50, 75, 100];

function pointFor(index, count, value) {
  const angle = (2 * Math.PI * index) / count - Math.PI / 2; // start at 12 o'clock
  const r = (value / 100) * MAX_RADIUS;
  return { x: CENTER + r * Math.cos(angle), y: CENTER + r * Math.sin(angle) };
}

function SkillRadar({ scores }) {
  const topics = Object.keys(scores);

  if (topics.length < 3) {
    return (
      <p className="py-12 text-center text-sm text-muted">
        Solve a few more problems across different topics to unlock your skill radar.
      </p>
    );
  }

  const polygonPoints = topics
    .map((t, i) => {
      const { x, y } = pointFor(i, topics.length, scores[t]);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="mx-auto w-full max-w-sm">
      {GRID_LEVELS.map((level) => (
        <circle
          key={level}
          cx={CENTER}
          cy={CENTER}
          r={(level / 100) * MAX_RADIUS}
          fill="none"
          className="stroke-border"
          strokeWidth="1"
        />
      ))}

      {topics.map((t, i) => {
        const { x, y } = pointFor(i, topics.length, 100);
        return <line key={t} x1={CENTER} y1={CENTER} x2={x} y2={y} className="stroke-border" strokeWidth="1" />;
      })}

      <polygon points={polygonPoints} className="fill-accent/25 stroke-accent" strokeWidth="2" />

      {topics.map((t, i) => {
        const { x, y } = pointFor(i, topics.length, 100);
        const labelPoint = pointFor(i, topics.length, 122);
        return (
          <g key={t}>
            <circle cx={x} cy={y} r="2.5" className="fill-accent" />
            <text
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted text-[9px]"
            >
              {t}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default SkillRadar;
