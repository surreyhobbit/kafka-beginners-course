interface LineChartPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  points: LineChartPoint[];
  unit?: string;
}

const WIDTH = 320;
const HEIGHT = 170;
const PAD_LEFT = 42;
const PAD_RIGHT = 10;
const PAD_TOP = 12;
const PAD_BOTTOM = 24;

export default function LineChart({ points, unit = '' }: LineChartProps) {
  if (points.length === 0) return null;

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const stepX = points.length > 1 ? plotWidth / (points.length - 1) : 0;

  const coords = points.map((p, i) => ({
    x: PAD_LEFT + stepX * i,
    y: PAD_TOP + plotHeight - ((p.value - min) / range) * plotHeight,
    ...p,
  }));

  const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full text-slate-500 dark:text-slate-400" role="img" aria-label="Progress over time chart">
      <line x1={PAD_LEFT} y1={PAD_TOP} x2={PAD_LEFT} y2={HEIGHT - PAD_BOTTOM} stroke="currentColor" strokeOpacity={0.25} />
      <line x1={PAD_LEFT} y1={HEIGHT - PAD_BOTTOM} x2={WIDTH - PAD_RIGHT} y2={HEIGHT - PAD_BOTTOM} stroke="currentColor" strokeOpacity={0.25} />

      <text x={PAD_LEFT - 4} y={PAD_TOP + 4} textAnchor="end" fontSize="9" fill="currentColor">
        {max.toFixed(1)}
        {unit}
      </text>
      <text x={PAD_LEFT - 4} y={HEIGHT - PAD_BOTTOM} textAnchor="end" fontSize="9" fill="currentColor">
        {min.toFixed(1)}
        {unit}
      </text>

      <path d={path} fill="none" stroke="rgb(16 185 129)" strokeWidth={2} />
      {coords.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={3} fill="rgb(16 185 129)" />
      ))}

      <text x={PAD_LEFT} y={HEIGHT - 4} fontSize="9" fill="currentColor">
        {coords[0].label}
      </text>
      <text x={WIDTH - PAD_RIGHT} y={HEIGHT - 4} textAnchor="end" fontSize="9" fill="currentColor">
        {coords[coords.length - 1].label}
      </text>
    </svg>
  );
}
