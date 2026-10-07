import { useEffect, useState, useCallback } from 'react';
import {
  Settings,
  Server,
  Cpu,
  Sliders,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Bell,
  Moon,
  Zap,
  ShieldAlert,
  Info,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Toggle } from '@/components/Toggle';
import { checkHealth } from '@/services/api';
import type { HealthStatus } from '@/types';

export function SettingsPage() {
  const [health, setHealth] = useState<HealthStatus>({
    api: 'unknown',
    model: 'unknown',
    modelLoaded: false,
    version: '—',
  });
  const [checking, setChecking] = useState(false);
  const [threshold, setThreshold] = useState(0.5);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [soundAlert, setSoundAlert] = useState(false);

  const runHealthCheck = useCallback(async () => {
    setChecking(true);
    try {
      const h = await checkHealth();
      setHealth(h);
    } catch {
      setHealth({ api: 'offline', model: 'offline', modelLoaded: false, version: '—' });
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    runHealthCheck();
  }, [runHealthCheck]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Settings"
        subtitle="Configure HelmX detection and system preferences"
        icon={Settings}
      />

      <div className="space-y-4 max-w-3xl">
        {/* System Status */}
        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Server size={18} className="text-primary-600" />
              <h2 className="text-base font-semibold text-ink-900">System Status</h2>
            </div>
            <button
              onClick={runHealthCheck}
              disabled={checking}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ink-50 hover:bg-ink-100 text-xs text-ink-500 font-medium transition-colors disabled:opacity-50"
            >
              {checking ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <StatusCard
              label="Backend API"
              icon={Server}
              status={health.api}
              detail={health.api === 'online' ? 'Connected & responding' : 'Not reachable'}
            />
            <StatusCard
              label="AI Model"
              icon={Cpu}
              status={health.model}
              detail={health.modelLoaded ? `Loaded · v${health.version}` : 'Model not loaded'}
            />
          </div>

          {/* Info banner */}
          <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-primary-50/50 border border-primary-100">
            <Info size={15} className="text-primary-500 shrink-0 mt-0.5" />
            <p className="text-xs text-primary-700 leading-relaxed">
              HelmX connects to a FastAPI backend running a custom YOLO model. The status above reflects the current connection state.
            </p>
          </div>
        </div>

        {/* Detection Settings */}
        <div className="card-base p-6">
          <div className="flex items-center gap-2 mb-5">
            <Sliders size={18} className="text-purple-600" />
            <h2 className="text-base font-semibold text-ink-900">Detection Settings</h2>
          </div>

          {/* Confidence threshold */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="text-sm text-ink-800 font-semibold">Confidence Threshold</label>
                <p className="text-xs text-ink-400 mt-0.5">Minimum confidence for valid detections</p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-primary-50 border border-primary-100">
                <span className="text-lg font-bold text-primary-600 font-mono">
                  {(threshold * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary-500"
              style={{
                background: `linear-gradient(to right, #3b82f6 ${threshold * 100}%, #e2e8f0 ${threshold * 100}%)`,
              }}
            />
            <div className="flex justify-between text-[10px] text-ink-400 mt-1.5">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="space-y-1">
            <SettingRow
              icon={Zap}
              title="Auto-Analyze Live Feed"
              desc="Automatically run detection every 2 seconds during live monitoring"
            >
              <Toggle checked={autoAnalyze} onChange={setAutoAnalyze} />
            </SettingRow>
            <SettingRow
              icon={ShieldAlert}
              title="Violation Notifications"
              desc="Get alerted when no-helmet detections occur"
            >
              <Toggle checked={notifications} onChange={setNotifications} />
            </SettingRow>
            <SettingRow
              icon={Bell}
              title="Sound Alerts"
              desc="Play an audible alert on violation detection"
            >
              <Toggle checked={soundAlert} onChange={setSoundAlert} />
            </SettingRow>
          </div>
        </div>

        {/* Application Settings */}
        <div className="card-base p-6">
          <div className="flex items-center gap-2 mb-5">
            <Moon size={18} className="text-primary-600" />
            <h2 className="text-base font-semibold text-ink-900">Application</h2>
          </div>
          <SettingRow
            icon={Moon}
            title="Dark Theme"
            desc="Use the dark color scheme (recommended for CV monitoring)"
          >
            <Toggle checked={darkMode} onChange={setDarkMode} />
          </SettingRow>
        </div>

        {/* About */}
        <div className="card-base p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-ink-900">HelmX</p>
              <p className="text-xs text-ink-400 mt-0.5">AI-Powered Helmet Detection & Safety Monitoring</p>
              <p className="text-[11px] text-ink-300 mt-1 italic">Smarter Roads. Safer Rides.</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-ink-400 uppercase tracking-wider">Version</p>
              <p className="text-sm font-mono font-semibold text-ink-700">v1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusCard({
  label,
  icon: Icon,
  status,
  detail,
}: {
  label: string;
  icon: typeof Server;
  status: 'online' | 'offline' | 'unknown';
  detail: string;
}) {
  const colorMap = {
    online: { text: 'text-success-600', bg: 'bg-success-50', border: 'border-success-200' },
    offline: { text: 'text-error-600', bg: 'bg-error-50', border: 'border-error-200' },
    unknown: { text: 'text-ink-400', bg: 'bg-ink-50', border: 'border-ink-200' },
  };
  const c = colorMap[status];

  return (
    <div className={`rounded-2xl p-4 border ${c.bg} ${c.border}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={18} className={c.text} />
          <span className="text-sm text-ink-700 font-medium">{label}</span>
        </div>
        {status === 'online' ? (
          <CheckCircle2 size={20} className={c.text} />
        ) : status === 'offline' ? (
          <XCircle size={20} className={c.text} />
        ) : (
          <Loader2 size={20} className={`${c.text} animate-spin`} />
        )}
      </div>
      <p className={`text-xs mt-2 font-medium ${c.text}`}>{detail}</p>
    </div>
  );
}

function SettingRow({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-ink-100/60 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-ink-50 flex items-center justify-center">
          <Icon size={16} className="text-ink-500" />
        </div>
        <div>
          <p className="text-sm text-ink-800 font-medium">{title}</p>
          <p className="text-xs text-ink-400 mt-0.5">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
