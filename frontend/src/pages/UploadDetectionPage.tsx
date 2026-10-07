import { useRef, useState, useCallback } from 'react';
import {
  CloudUpload,
  FileImage,
  FileVideo,
  X,
  Loader2,
  AlertTriangle,
  HardHat,
  ShieldCheck,
  Eye,
  CheckCircle2,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { analyzeImage, analyzeVideo } from '@/services/api';
import { getComplianceStatus } from '@/lib/utils';
import type { DetectionResult } from '@/types';

const ACCEPTED_IMAGE = ['image/jpeg', 'image/jpg', 'image/png'];
const ACCEPTED_VIDEO = ['video/mp4'];
const MAX_SIZE = 100 * 1024 * 1024;

export function UploadDetectionPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);

  const handleFile = useCallback((f: File) => {
    setError(null);
    setResult(null);

    const isImage = ACCEPTED_IMAGE.includes(f.type);
    const isVideo = ACCEPTED_VIDEO.includes(f.type);

    if (!isImage && !isVideo) {
      setError('Unsupported file type. Please upload JPG, PNG, or MP4.');
      return;
    }
    if (f.size > MAX_SIZE) {
      setError('File is too large. Maximum size is 100MB.');
      return;
    }

    setFile(f);
    setFileType(isImage ? 'image' : 'video');
    setPreviewUrl(URL.createObjectURL(f));
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setFileType(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const runAnalysis = async () => {
    if (!file || !fileType) return;
    setAnalyzing(true);
    setError(null);
    try {
      const res = fileType === 'image' ? await analyzeImage(file) : await analyzeVideo(file);
      setResult(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Analysis failed: ${err.message}`
          : 'Analysis failed. Make sure the backend is running.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const total = result ? result.helmetCount + result.noHelmetCount : 0;
  const compliance = result && total > 0 ? (result.helmetCount / total) * 100 : 0;
  const status = getComplianceStatus(compliance);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Upload & Analyze"
        subtitle="Upload an image or video to detect helmet compliance."
        icon={CloudUpload}
        badge="AI Analysis"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upload zone */}
        <div className="card-base p-6">
          <h2 className="text-base font-semibold text-ink-900 mb-4">Upload File</h2>

          {!file ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center py-16 ${
                dragging
                  ? 'border-primary-400 bg-primary-50/50 scale-[1.01]'
                  : 'border-ink-200 hover:border-primary-300 hover:bg-ink-50/50'
              }`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${
                dragging ? 'gradient-primary shadow-glow scale-110' : 'bg-ink-50'
              }`}>
                <CloudUpload size={28} className={dragging ? 'text-white' : 'text-ink-400'} />
              </div>
              <p className="text-sm font-semibold text-ink-700">
                {dragging ? 'Drop file here' : 'Drag and drop your file here'}
              </p>
              <p className="text-xs text-ink-400 mt-1">or click to browse from your computer</p>

              <div className="mt-5 px-4 py-2 rounded-xl bg-white border border-ink-200 shadow-sm text-xs font-medium text-primary-600">
                Browse Files
              </div>

              <div className="flex items-center gap-2 mt-5">
                <FormatTag label="JPG" />
                <FormatTag label="PNG" />
                <FormatTag label="MP4" />
              </div>

              <input
                ref={inputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.mp4"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </div>
          ) : (
            <div className="space-y-4 animate-slide-up">
              {/* File info bar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-ink-50">
                <div className="flex items-center gap-3 min-w-0">
                  {fileType === 'image' ? (
                    <FileImage size={20} className="text-primary-600 shrink-0" />
                  ) : (
                    <FileVideo size={20} className="text-purple-600 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm text-ink-800 font-medium truncate">{file.name}</p>
                    <p className="text-xs text-ink-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={clearFile}
                  className="p-1.5 rounded-lg hover:bg-white text-ink-400 hover:text-ink-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Preview */}
              <div className="rounded-2xl overflow-hidden bg-ink-900 border border-ink-200">
                {fileType === 'image' ? (
                  <img src={previewUrl || undefined} alt="Preview" className="w-full max-h-72 object-contain" />
                ) : (
                  <video src={previewUrl || undefined} controls className="w-full max-h-72 object-contain" />
                )}
              </div>

              {/* Analyze button */}
              <button
                onClick={runAnalysis}
                disabled={analyzing}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl gradient-primary hover:opacity-90 disabled:opacity-50 text-white font-medium text-sm transition-all shadow-glow"
              >
                {analyzing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Analyzing…
                  </>
                ) : (
                  <>
                    <Sparkles size={18} /> Analyze File
                  </>
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-error-50 border border-error-200 animate-slide-up">
              <AlertTriangle size={16} className="text-error-500 shrink-0 mt-0.5" />
              <p className="text-sm text-error-700">{error}</p>
            </div>
          )}
        </div>

        {/* Results panel */}
        <div className="card-base p-6">
          <h2 className="text-base font-semibold text-ink-900 mb-4">Detection Results</h2>

          {!result && !analyzing && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-ink-50 flex items-center justify-center mb-4">
                <ShieldCheck size={28} className="text-ink-300" />
              </div>
              <p className="text-sm font-medium text-ink-500">No analysis yet</p>
              <p className="text-xs text-ink-400 mt-1">Upload a file and run analysis to see results</p>
            </div>
          )}

          {analyzing && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-ink-100" />
                <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
              </div>
              <p className="text-sm font-medium text-ink-600 mt-4">Running detection model…</p>
              <p className="text-xs text-ink-400 mt-1">This may take a few seconds</p>
            </div>
          )}

          {result && !analyzing && (
            <div className="space-y-4 animate-slide-up">
              {/* Compliance banner */}
              <div className={`rounded-2xl p-4 border ${
                status === 'safe' ? 'bg-success-50 border-success-200' :
                status === 'warning' ? 'bg-warning-50 border-warning-200' :
                'bg-error-50 border-error-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {status === 'safe' ? (
                      <CheckCircle2 size={22} className="text-success-600" />
                    ) : (
                      <AlertTriangle size={22} className={status === 'warning' ? 'text-warning-600' : 'text-error-600'} />
                    )}
                    <span className="text-sm font-semibold text-ink-900">
                      {result.violations ? 'Violations Detected' : 'All Clear'}
                    </span>
                  </div>
                  <StatusBadge status={status} />
                </div>
              </div>

              {/* Count cards */}
              <div className="grid grid-cols-2 gap-3">
                <ResultCountCard
                  icon={HardHat}
                  label="Helmet"
                  value={result.helmetCount}
                  gradient="gradient-success"
                />
                <ResultCountCard
                  icon={AlertTriangle}
                  label="No Helmet"
                  value={result.noHelmetCount}
                  gradient="gradient-error"
                />
              </div>

              {/* Metrics */}
              <div className="space-y-2">
                <MetricRow label="Compliance" value={`${compliance.toFixed(1)}%`} />
                <MetricRow label="Total Detected" value={total.toString()} />
                <MetricRow label="Avg Confidence" value={`${(result.confidence * 100).toFixed(1)}%`} />
                <MetricRow label="Violation Status" value={result.violations ? 'Violations Found' : 'No Violations'} />
              </div>

              {/* Annotated output placeholder */}
              <div className="rounded-2xl bg-ink-50 border border-ink-200 p-4">
                <p className="text-xs text-ink-400 uppercase tracking-wider mb-2 font-medium">Annotated Output</p>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-2 shadow-sm">
                    <Eye size={24} className="text-ink-300" />
                  </div>
                  <p className="text-xs text-ink-400">Annotated results will appear here</p>
                  <p className="text-[11px] text-ink-300 mt-0.5">once the FastAPI backend is connected</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FormatTag({ label }: { label: string }) {
  return (
    <span className="px-2.5 py-1 rounded-lg bg-ink-100 text-ink-500 text-[10px] font-semibold uppercase tracking-wider">
      {label}
    </span>
  );
}

function ResultCountCard({
  icon: Icon,
  label,
  value,
  gradient,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  gradient: string;
}) {
  return (
    <div className="rounded-2xl p-4 bg-ink-50/50 border border-ink-200/60">
      <div className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center mb-3 shadow-sm`}>
        <Icon size={18} className="text-white" strokeWidth={2.5} />
      </div>
      <p className="text-xs text-ink-400 font-medium">{label}</p>
      <p className="text-3xl font-bold text-ink-900 font-mono mt-1">{value}</p>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-ink-50/50 border border-ink-200/60">
      <span className="text-sm text-ink-500">{label}</span>
      <span className="text-sm font-semibold text-ink-800 font-mono">{value}</span>
    </div>
  );
}
