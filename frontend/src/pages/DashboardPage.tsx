import { useEffect, useState } from 'react';
import {
  Users,
  HardHat,
  AlertTriangle,
  ShieldCheck,
  Activity,
  TrendingUp,
  Clock,
  ArrowRight,
  Video,
  CloudUpload,
  History,
  MoreVertical,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { ComplianceGauge } from '@/components/ComplianceGauge';
import { TrendChart } from '@/components/TrendChart';
import { StatusBadge } from '@/components/StatusBadge';
import { getStatistics, getDetectionHistory } from '@/services/api';
import { formatTime, getComplianceStatus } from '@/lib/utils';
import type { Statistics, DetectionRecord, TrendPoint, PageId } from '@/types';

interface DashboardPageProps {
  onNavigate: (page: PageId) => void;
}

const HERO_IMAGE = 'https://images.pexels.com/photos/19014330/pexels-photo-19014330.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [stats, setStats] = useState<Statistics>({
    totalDetected: 0,
    helmetCount: 0,
    noHelmetCount: 0,
    compliance: 0,
    totalSessions: 0,
  });
  const [history, setHistory] = useState<DetectionRecord[]>([]);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartFilter, setChartFilter] = useState<'7' | '30' | 'all'>('7');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [s, h] = await Promise.all([getStatistics(), getDetectionHistory()]);
        if (!mounted) return;
        setStats(s);
        setHistory(h);
        const recent = h.slice(0, 12).reverse();
        setTrend(recent.map((r, i) => ({ label: `T${i + 1}`, value: r.compliance })));
      } catch {
        // API not yet connected
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const recentViolations = history.filter((r) => r.noHelmetCount > 0).slice(0, 5);
  const complianceStatus = getComplianceStatus(stats.compliance);

  // Sparkline sample data
  const sparkTotal = [20, 35, 28, 42, 38, 55, 60];
  const sparkHelmet = [15, 28, 22, 35, 30, 45, 52];
  const sparkNoHelmet = [5, 7, 6, 7, 8, 10, 8];
  const sparkCompliance = [75, 80, 78, 83, 79, 82, 87];

  return (
    <div className="animate-fade-in">
      {/* Hero section */}
      <div className="relative overflow-hidden rounded-3xl mb-6 shadow-card">
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Motorcyclist wearing helmet"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950/90 via-ink-900/75 to-ink-900/30" />
        </div>
        <div className="relative px-6 py-10 sm:px-10 sm:py-14 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-4">
            <Sparkles size={13} className="text-primary-300" />
            <span className="text-[11px] font-semibold text-white uppercase tracking-wider">AI Safety Monitoring</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
            AI-Powered Helmet Detection
          </h1>
          <p className="text-sm sm:text-base text-white/70 mt-2 leading-relaxed max-w-lg">
            Real-time monitoring for safer roads and smarter safety decisions.
          </p>
        </div>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Total People Detected"
              value={stats.totalDetected}
              icon={Users}
              accent="primary"
              sublabel={`${stats.totalSessions} sessions`}
              sparklineData={sparkTotal}
              trend={12}
            />
            <StatCard
              label="Helmet Detected"
              value={stats.helmetCount}
              icon={HardHat}
              accent="success"
              sublabel="Wearing helmets"
              sparklineData={sparkHelmet}
              trend={8}
            />
            <StatCard
              label="No Helmet"
              value={stats.noHelmetCount}
              icon={AlertTriangle}
              accent="error"
              sublabel="Violations found"
              sparklineData={sparkNoHelmet}
              trend={-5}
            />
            <StatCard
              label="Compliance Rate"
              value={`${stats.compliance.toFixed(1)}%`}
              icon={ShieldCheck}
              accent="purple"
              sublabel={complianceStatus === 'safe' ? 'Above threshold' : 'Needs attention'}
              sparklineData={sparkCompliance}
              trend={3}
            />
          </div>

          {/* Analytics + Compliance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Detection analytics */}
            <div className="lg:col-span-2 card-base p-6">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-primary-600" />
                  <h2 className="text-base font-semibold text-ink-900">Detection Statistics</h2>
                </div>
                <div className="flex items-center gap-1 bg-ink-50 rounded-lg p-0.5">
                  {([['7', 'Last 7 days'], ['30', 'Last 30 days'], ['all', 'All time']] as const).map(([key, lbl]) => (
                    <button
                      key={key}
                      onClick={() => setChartFilter(key)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        chartFilter === key
                          ? 'bg-white text-primary-600 shadow-sm'
                          : 'text-ink-400 hover:text-ink-600'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mini summary row */}
              <div className="flex items-center gap-6 mb-2 mt-4">
                <SummaryDot label="Total" value={stats.totalDetected} color="bg-primary-500" />
                <SummaryDot label="Helmet" value={stats.helmetCount} color="bg-success-500" />
                <SummaryDot label="No Helmet" value={stats.noHelmetCount} color="bg-error-500" />
                <div className="ml-auto flex items-center gap-1 text-xs text-success-600 font-medium">
                  <TrendingUp size={14} /> Trending up
                </div>
              </div>

              <TrendChart data={trend} />
            </div>

            {/* Compliance gauge */}
            <div className="card-base p-6 flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 self-start mb-4">
                <ShieldCheck size={18} className="text-purple-600" />
                <h2 className="text-base font-semibold text-ink-900">Safety Score</h2>
              </div>
              <ComplianceGauge value={stats.compliance} size={170} />
              <div className="mt-4 w-full space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-400">Helmet detected</span>
                  <span className="font-semibold text-success-600 font-mono">{stats.helmetCount}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-400">Violations</span>
                  <span className="font-semibold text-error-600 font-mono">{stats.noHelmetCount}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-400">Status</span>
                  <StatusBadge status={complianceStatus} size="sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent violations + Quick actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Recent violations */}
            <div className="lg:col-span-2 card-base p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-error-500" />
                  <h2 className="text-base font-semibold text-ink-900">Recent Violations</h2>
                </div>
                <button
                  onClick={() => onNavigate('history')}
                  className="text-xs text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1 transition-colors"
                >
                  View all <ArrowRight size={13} />
                </button>
              </div>

              {recentViolations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-success-50 flex items-center justify-center mb-3">
                    <ShieldCheck size={28} className="text-success-500" />
                  </div>
                  <p className="text-sm font-medium text-ink-600">No violations detected</p>
                  <p className="text-xs text-ink-400 mt-1">All recent detections show full compliance</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentViolations.map((v) => (
                    <ViolationRow key={v.id} record={v} />
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="space-y-3">
              <QuickAction
                title="Live Detection"
                desc="Real-time helmet detection using your camera"
                icon={Video}
                gradient="from-primary-500 to-primary-700"
                onClick={() => onNavigate('live')}
              />
              <QuickAction
                title="Upload & Analyze"
                desc="Upload images or videos for AI analysis"
                icon={CloudUpload}
                gradient="from-purple-500 to-purple-700"
                onClick={() => onNavigate('upload')}
              />
              <QuickAction
                title="View History"
                desc="Review previous detections and safety analytics"
                icon={History}
                gradient="from-success-500 to-success-700"
                onClick={() => onNavigate('history')}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryDot({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <span className="text-xs text-ink-400">{label}</span>
      <span className="text-xs font-bold text-ink-800 font-mono">{value}</span>
    </div>
  );
}

function ViolationRow({ record }: { record: DetectionRecord }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-ink-50/50 hover:bg-ink-50 transition-colors group">
      <div className="flex items-center gap-3">
        {/* Thumbnail placeholder */}
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-error-100 to-error-50 flex items-center justify-center shrink-0">
          <AlertTriangle size={18} className="text-error-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-ink-800">No Helmet Detected</p>
          <p className="text-xs text-ink-400 flex items-center gap-1 mt-0.5">
            <Clock size={11} /> {formatTime(record.timestamp)}
            <span className="mx-1">·</span>
            <span className="capitalize">{record.inputType}</span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-[10px] text-ink-400 uppercase tracking-wider">Confidence</p>
          <p className="text-xs font-semibold text-ink-700 font-mono">92%</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-error-50 border border-error-200 text-error-600 text-[10px] font-semibold">
          Violation
        </span>
        <button className="p-1 rounded-lg text-ink-300 hover:text-ink-600 hover:bg-white transition-colors opacity-0 group-hover:opacity-100">
          <MoreVertical size={15} />
        </button>
      </div>
    </div>
  );
}

function QuickAction({
  title,
  desc,
  icon: Icon,
  gradient,
  onClick,
}: {
  title: string;
  desc: string;
  icon: LucideIcon;
  gradient: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="card-base p-5 w-full text-left group relative overflow-hidden"
    >
      <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} opacity-[0.07] group-hover:opacity-[0.12] transition-opacity blur-2xl`} />
      <div className="relative flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm shrink-0`}>
          <Icon size={22} className="text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink-900">{title}</p>
          <p className="text-xs text-ink-400 mt-0.5 leading-relaxed">{desc}</p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-ink-50 flex items-center justify-center group-hover:bg-primary-50 transition-colors shrink-0">
          <ArrowRight size={16} className="text-ink-400 group-hover:text-primary-600 transition-colors" />
        </div>
      </div>
    </button>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 h-36 shadow-card" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-6 h-80 lg:col-span-2 shadow-card" />
        <div className="bg-white rounded-2xl p-6 h-80 shadow-card" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 h-64 lg:col-span-2 shadow-card" />
        <div className="bg-white rounded-2xl p-6 h-64 shadow-card" />
      </div>
    </div>
  );
}
