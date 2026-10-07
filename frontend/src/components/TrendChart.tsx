import type { TrendPoint } from '@/types';

interface TrendChartProps {
  data: TrendPoint[];
  height?: number;
}

export function TrendChart({ data, height = 220 }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-ink-300 text-sm" style={{ height }}>
        No trend data yet — run detections to see analytics
      </div>
    );
  }

  const width = 700;
  const padding = { top: 20, right: 24, bottom: 34, left: 44 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values, 100);
  const minVal = Math.min(...values, 0);
  const range = maxVal - minVal || 1;

  const points = data.map((d, i) => {
    const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartW;
    const y = padding.top + chartH - ((d.value - minVal) / range) * chartH;
    return { x, y, ...d };
  });

  // Build smooth path
  const linePath = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const cpx = (prev.x + p.x) / 2;
      return `C ${cpx} ${prev.y} ${cpx} ${p.y} ${p.x} ${p.y}`;
    })
    .join(' ');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map((v) => {
        const y = padding.top + chartH - ((v - minVal) / range) * chartH;
        return (
          <g key={v}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-ink-100"
              strokeDasharray="3 4"
            />
            <text x={padding.left - 10} y={y + 4} textAnchor="end" className="text-ink-300 fill-current text-[10px] font-medium">
              {v}
            </text>
          </g>
        );
      })}

      {/* Area */}
      <path d={areaPath} fill="url(#trendArea)" />
      {/* Line */}
      <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

      {/* Points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
          <text x={p.x} y={height - 12} textAnchor="middle" className="text-ink-300 fill-current text-[10px] font-medium">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
