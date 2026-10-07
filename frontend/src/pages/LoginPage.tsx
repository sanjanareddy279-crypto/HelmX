import { useState, type FormEvent } from 'react';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { login } from '@/services/auth';
import type { AuthUser } from '@/services/auth';

const HERO_IMAGE = 'https://images.pexels.com/photos/19014330/pexels-photo-19014330.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

interface LoginPageProps {
  onSuccess: (user: AuthUser) => void;
}

export function LoginPage({ onSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    // Simulate brief async for UX
    setTimeout(() => {
      try {
        const user = login(email, password);
        onSuccess(user);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid email or password.');
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex bg-ink-50">
      {/* Left side — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-purple-700" />
        <div className="absolute inset-0 opacity-20">
          <img
            src={HERO_IMAGE}
            alt="Motorcyclist wearing helmet"
            className="w-full h-full object-cover mix-blend-overlay"
          />
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-purple-400/20 blur-3xl" />

        <div className="relative flex flex-col justify-between p-12 xl:p-16 text-white w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <ShieldCheck size={26} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">HelmX</h1>
              <p className="text-xs text-white/70 font-medium">Smarter Roads. Safer Rides.</p>
            </div>
          </div>

          {/* Center content */}
          <div className="max-w-md">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-5">
              <Sparkles size={13} className="text-primary-200" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">AI Safety Platform</span>
            </div>
            <h2 className="text-3xl xl:text-4xl font-bold leading-tight tracking-tight">
              AI-Powered Helmet Detection & Safety Monitoring
            </h2>
            <p className="text-base text-white/70 mt-4 leading-relaxed">
              Real-time computer vision for smarter road safety. Detect helmet compliance, track violations, and make data-driven safety decisions.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mt-6">
              {['Real-time Detection', 'Violation Tracking', 'Safety Analytics'].map((feat) => (
                <span
                  key={feat}
                  className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 text-xs font-medium text-white/90"
                >
                  {feat}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 text-xs text-white/50">
            <ShieldCheck size={14} />
            <span>© 2026 HelmX. All rights reserved.</span>
          </div>
        </div>
      </div>

      {/* Right side — login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile logo */}
        <div className="absolute top-6 left-6 lg:hidden flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
            <ShieldCheck size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-base font-bold text-ink-900 tracking-tight">HelmX</h1>
            <p className="text-[10px] text-ink-400 font-medium">Smarter Roads. Safer Rides.</p>
          </div>
        </div>

        <div className="w-full max-w-sm animate-slide-up">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-ink-900 tracking-tight">Welcome back</h2>
            <p className="text-sm text-ink-400 mt-1">Sign in to HelmX to continue</p>
          </div>

          {/* Demo credentials hint */}
          <div className="mb-5 p-3 rounded-xl bg-primary-50/60 border border-primary-100">
            <p className="text-[11px] font-semibold text-primary-700 uppercase tracking-wider mb-1">Demo Credentials</p>
            <p className="text-xs text-primary-600/80 font-mono">demo@helmx.ai · HelmX@123</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-ink-200 text-sm text-ink-800 placeholder-ink-300 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/10 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-white border border-ink-200 text-sm text-ink-800 placeholder-ink-300 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-400 hover:text-ink-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Remember + forgot */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setRemember((r) => !r)}
                className="flex items-center gap-2 group"
              >
                <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                  remember
                    ? 'bg-primary-500 border-primary-500'
                    : 'bg-white border-ink-300 group-hover:border-ink-400'
                }`}>
                  {remember && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-xs text-ink-500 group-hover:text-ink-700 transition-colors">Remember me</span>
              </button>
              <button
                type="button"
                className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-error-50 border border-error-200 animate-slide-up">
                <AlertCircle size={16} className="text-error-500 shrink-0 mt-0.5" />
                <p className="text-sm text-error-700">{error}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl gradient-primary hover:opacity-90 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-glow group"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-ink-400 mt-6">
            Protected by HelmX AI Safety Platform
          </p>
        </div>
      </div>
    </div>
  );
}
