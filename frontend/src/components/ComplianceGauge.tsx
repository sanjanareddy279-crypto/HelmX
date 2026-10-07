interface ComplianceGaugeProps {
  value: number;
  size?: number;
}

export function ComplianceGauge({ value, size = 180 }: ComplianceGaugeProps) {
  const radius = size / 2 - 14;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;

  const color = clamped >= 85 ? '#22c55e' : clamped >= 60 ? '#f59e0b' : '#ef4444';
  const label = clamped >= 85 ? 'Safe' : clamped >= 60 ? 'Warning' : 'Critical';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-ink-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.4s' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold text-ink-900 font-mono tabular-nums">{clamped.toFixed(0)}%</span>
        <span className="text-xs text-ink-400 uppercase tracking-wider mt-0.5">Compliance</span>
        <span
          className="text-[10px] font-semibold mt-1 px-2 py-0.5 rounded-full"
          style={{ color, backgroundColor: `${color}15` }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
