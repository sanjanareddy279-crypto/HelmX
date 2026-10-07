import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent: 'primary' | 'success' | 'error' | 'warning' | 'purple';
  sublabel?: string;
  trend?: number;
  sparklineData?: number[];
}

const accentMap = {
  primary: {
    bg: 'bg-primary-50',
    text: 'text-primary-600',
    iconBg: 'gradient-primary',
    glow: 'shadow-glow',
    sparkStroke: '#3b82f6',
    sparkFill: 'rgba(59,130,246,0.1)',
  },
  success: {
    bg: 'bg-success-50',
    text: 'text-success-600',
    iconBg: 'gradient-success',
    glow: 'shadow-glow-success',
    sparkStroke: '#22c55e',
    sparkFill: 'rgba(34,197,94,0.1)',
  },
  error: {
    bg: 'bg-error-50',
    text: 'text-error-600',
    iconBg: 'gradient-error',
    glow: 'shadow-glow-error',
    sparkStroke: '#ef4444',
    sparkFill: 'rgba(239,68,68,0.1)',
  },
  warning: {
    bg: 'bg-warning-50',
    text: 'text-warning-600',
    iconBg: 'bg-gradient-to-br from-warning-400 to-warning-600',
    glow: '',
    sparkStroke: '#f59e0b',
    sparkFill: 'rgba(245,158,11,0.1)',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    iconBg: 'gradient-purple',
    glow: '',
    sparkStroke: '#a855f7',
    sparkFill: 'rgba(168,85,247,0.1)',
  },
};

export function StatCard({ label, value, icon: Icon, accent, sublabel, trend, sparklineData }: StatCardProps) {
  const a = accentMap[accent];
  return (
    <div className="card-base p-5 group relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-ink-900 mt-2 font-mono tabular-nums tracking-tight">{value}</p>
          {sublabel && <p className="text-xs text-ink-400 mt-1">{sublabel}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl ${a.iconBg} flex items-center justify-center shadow-sm`}>
          <Icon size={20} className="text-white" strokeWidth={2.5} />
        </div>
      </div>

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 1 && (
        <div className="mt-3 -mb-1">
          <MiniSparkline data={sparklineData} stroke={a.sparkStroke} fill={a.sparkFill} />
        </div>
      )}

      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span className={`flex items-center gap-0.5 font-semibold ${trend >= 0 ? 'text-success-600' : 'text-error-600'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-ink-400">vs last period</span>
        </div>
      )}
    </div>
  );
}

function MiniSparkline({ data, stroke, fill }: { data: number[]; stroke: string; fill: string }) {
  const w = 100;
  const h = 30;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });
  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${w},${h} L 0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height: 30 }}>
      <path d={areaPath} fill={fill} />
      <path d={linePath} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
