import { useRef, useState, useEffect, useCallback } from 'react';
import {
  Video,
  Play,
  Square,
  AlertTriangle,
  HardHat,
  Users,
  Gauge,
  ShieldCheck,
  Eye,
  CircleCheck,
  Loader2,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { getComplianceStatus } from '@/lib/utils';
import { analyzeImage } from '@/services/api';

export function LiveDetectionPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [helmetCount, setHelmetCount] = useState(0);
  const [noHelmetCount, setNoHelmetCount] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [fps, setFps] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);

  const frameTimesRef = useRef<number[]>([]);
  const captureIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsRunning(true);

      let lastCapture = performance.now();
      captureIntervalRef.current = setInterval(() => {
        const now = performance.now();
        const delta = now - lastCapture;
        lastCapture = now;
        frameTimesRef.current.push(delta);
        if (frameTimesRef.current.length > 30) frameTimesRef.current.shift();
        const avg = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
        setFps(Math.round(1000 / avg));
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to access camera');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsRunning(false);
    setFps(0);
    setHelmetCount(0);
    setNoHelmetCount(0);
    setConfidence(0);
  }, []);

  useEffect(() => {
    return () => {
      if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const runDetection = useCallback(async () => {
    if (!videoRef.current || !isRunning) return;
    const video = videoRef.current;
    if (video.readyState < 2) return;

    setAnalyzing(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.85)
      );
      if (!blob) return;

      const file = new File([blob], 'frame.jpg', { type: 'image/jpeg' });
      const result = await analyzeImage(file);
      setHelmetCount(result.helmetCount);
      setNoHelmetCount(result.noHelmetCount);
      setConfidence(result.confidence);
    } catch {
      // Backend not connected
    } finally {
      setAnalyzing(false);
    }
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(runDetection, 2000);
    return () => clearInterval(id);
  }, [isRunning, runDetection]);

  const total = helmetCount + noHelmetCount;
  const compliance = total > 0 ? (helmetCount / total) * 100 : 100;
  const status = getComplianceStatus(compliance);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Live Detection"
        subtitle="Real-time helmet detection via webcam feed"
        icon={Video}
        badge="Real-time"
      />

      {/* System ready indicator */}
      <div className="flex items-center gap-2 mb-4">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
          isRunning
            ? 'bg-success-50 text-success-700 border border-success-200'
            : 'bg-ink-50 text-ink-500 border border-ink-200'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-success-500 animate-pulse' : 'bg-ink-300'}`} />
          {isRunning ? 'System Active' : 'System Ready'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Camera preview */}
        <div className="lg:col-span-2 card-base p-4">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-ink-900 border border-ink-200">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />

            {/* Scan line overlay */}
            {isRunning && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-400 to-transparent animate-scan-line" />
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-500/90 backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="text-xs font-semibold text-white">LIVE</span>
                </div>
                {analyzing && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-500/80 backdrop-blur-sm">
                    <Eye size={12} className="text-white" />
                    <span className="text-xs font-semibold text-white">Analyzing…</span>
                  </div>
                )}
              </div>
            )}

            {/* Idle state */}
            {!isRunning && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-ink-400 bg-gradient-to-br from-ink-50 to-ink-100">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3">
                  <Video size={32} strokeWidth={1.5} className="text-ink-300" />
                </div>
                <p className="text-sm font-medium text-ink-500">Camera is off</p>
                <p className="text-xs text-ink-400 mt-1">Press Start to begin live detection</p>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-gradient-to-br from-error-50 to-ink-50">
                <div className="w-14 h-14 rounded-2xl bg-error-100 flex items-center justify-center mb-3">
                  <AlertTriangle size={28} className="text-error-500" />
                </div>
                <p className="text-sm font-medium text-error-700">{error}</p>
                <p className="text-xs text-ink-400 mt-1">Make sure camera permissions are granted</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={startCamera}
              disabled={isRunning}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm transition-all shadow-glow"
            >
              <Play size={16} fill="currentColor" /> Start Camera
            </button>
            <button
              onClick={stopCamera}
              disabled={!isRunning}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ink-100 hover:bg-ink-200 disabled:opacity-40 disabled:cursor-not-allowed text-ink-600 font-medium text-sm transition-all"
            >
              <Square size={16} fill="currentColor" /> Stop Camera
            </button>
            {isRunning && (
              <button
                onClick={runDetection}
                disabled={analyzing}
                className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-50 hover:bg-primary-100 border border-primary-200 text-primary-600 font-medium text-sm transition-all disabled:opacity-50"
              >
                {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                {analyzing ? 'Analyzing…' : 'Analyze Now'}
              </button>
            )}
          </div>
        </div>

        {/* Stats panel */}
        <div className="space-y-3">
          {/* Safety status */}
          <div className="card-base p-5">
            <p className="text-xs text-ink-400 uppercase tracking-wider mb-3 font-medium">Safety Status</p>
            <div className="flex items-center justify-between">
              <StatusBadge status={status} />
              <div className="text-right">
                <span className="text-2xl font-bold text-ink-900 font-mono">{compliance.toFixed(0)}%</span>
                <p className="text-[10px] text-ink-400">compliance</p>
              </div>
            </div>
          </div>

          {/* Detection counts */}
          <div className="card-base p-5 space-y-3">
            <p className="text-xs text-ink-400 uppercase tracking-wider font-medium">Detection Stats</p>
            <CountRow icon={HardHat} label="Helmet" value={helmetCount} accent="success" />
            <CountRow icon={AlertTriangle} label="No Helmet" value={noHelmetCount} accent="error" />
            <CountRow icon={Users} label="People Detected" value={total} accent="primary" />
          </div>

          {/* Performance */}
          <div className="card-base p-5 space-y-3">
            <p className="text-xs text-ink-400 uppercase tracking-wider font-medium">Performance</p>
            <MetricRow icon={Gauge} label="FPS" value={fps.toString()} color="text-primary-600" />
            <MetricRow
              icon={CircleCheck}
              label="Confidence"
              value={`${(confidence * 100).toFixed(1)}%`}
              color="text-purple-600"
            />
            <MetricRow
              icon={ShieldCheck}
              label="Model Status"
              value={isRunning ? 'Active' : 'Idle'}
              color={isRunning ? 'text-success-600' : 'text-ink-400'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function CountRow({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof HardHat;
  label: string;
  value: number;
  accent: 'success' | 'error' | 'primary';
}) {
  const map = {
    success: { bg: 'bg-success-50', text: 'text-success-600', value: 'text-success-700' },
    error: { bg: 'bg-error-50', text: 'text-error-600', value: 'text-error-700' },
    primary: { bg: 'bg-primary-50', text: 'text-primary-600', value: 'text-primary-700' },
  };
  const c = map[accent];
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl ${c.bg}`}>
      <div className="flex items-center gap-2">
        <Icon size={18} className={c.text} />
        <span className="text-sm text-ink-600 font-medium">{label}</span>
      </div>
      <span className={`text-xl font-bold font-mono ${c.value}`}>{value}</span>
    </div>
  );
}

function MetricRow({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-ink-500">
        <Icon size={15} />
        <span className="text-sm">{label}</span>
      </div>
      <span className={`text-sm font-bold font-mono ${color}`}>{value}</span>
    </div>
  );
}
