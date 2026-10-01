// Hand-rolled SVG radar chart - no charting library needed for one simple
// polygon-on-axes plot, keeping the dependency list minimal.
const SIZE = 340;
const CENTER = SIZE / 2;
const MAX_RADIUS = SIZE / 2 - 56; // leaves room for topic labels around the edge
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
      <p className="py-10 text-sm text-muted">
        Solve problems in at least three topics to draw your radar. Practice or a LeetCode link both count.
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
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="mx-auto w-full max-w-md"
      role="img"
      aria-label={`Skill radar: ${topics.map((t) => `${t} ${scores[t]}`).join(', ')}`}
    >
      {GRID_LEVELS.map((level) => (
        <polygon
          key={level}
          points={topics
            .map((_, i) => {
              const { x, y } = pointFor(i, topics.length, level);
              return `${x},${y}`;
            })
            .join(' ')}
          fill="none"
          stroke="var(--color-rule)"
          strokeWidth="1"
        />
      ))}

      {topics.map((t, i) => {
        const { x, y } = pointFor(i, topics.length, 100);
        return <line key={t} x1={CENTER} y1={CENTER} x2={x} y2={y} stroke="var(--color-rule)" strokeWidth="1" />;
      })}

      <polygon points={polygonPoints} fill="var(--color-p1)" fillOpacity="0.18" stroke="var(--color-p1)" strokeWidth="2" />

      {topics.map((t, i) => {
        const point = pointFor(i, topics.length, scores[t]);
        const labelPoint = pointFor(i, topics.length, 124);
        return (
          <g key={t}>
            <rect x={point.x - 3} y={point.y - 3} width="6" height="6" fill="var(--color-p1)" />
            <text
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--color-ink)"
              fontSize="11"
              fontWeight="600"
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
