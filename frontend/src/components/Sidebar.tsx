import type { LucideIcon } from 'lucide-react';
import {
  LayoutGrid,
  Video,
  CloudUpload,
  History,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import type { PageId } from '@/types';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'live', label: 'Live Detection', icon: Video },
  { id: 'upload', label: 'Upload & Analyze', icon: CloudUpload },
  { id: 'history', label: 'Detection History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 z-40 bg-white border-r border-ink-200/70">
        <SidebarContent currentPage={currentPage} onNavigate={onNavigate} />
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-xl border-t border-ink-200/70 shadow-lg">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-all text-[10px] font-medium ${
                  active
                    ? 'text-primary-600'
                    : 'text-ink-400 hover:text-ink-600'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                <span>{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function SidebarContent({ currentPage, onNavigate }: SidebarProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <ShieldCheck size={22} className="text-white" strokeWidth={2.5} />
          </div>
        </div>
        <div>
          <h1 className="text-lg font-bold text-ink-900 tracking-tight">HelmX</h1>
          <p className="text-[10px] text-ink-400 font-medium">Smarter Roads. Safer Rides.</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 py-1 text-[10px] font-semibold text-ink-300 uppercase tracking-widest">Menu</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-ink-500 hover:text-ink-800 hover:bg-ink-50'
              }`}
            >
              <Icon
                size={18}
                strokeWidth={active ? 2.5 : 2}
                className={active ? 'text-primary-600' : 'text-ink-400 group-hover:text-ink-600'}
              />
              {item.label}
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Promo card */}
      <div className="px-4 pb-5">
        <div className="relative overflow-hidden rounded-2xl gradient-primary p-4 shadow-glow">
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10" />
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center mb-2">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <p className="text-sm font-semibold text-white">Every Ride Counts</p>
            <p className="text-[11px] text-white/80 mt-1 leading-relaxed">
              AI-powered safety monitoring for a safer tomorrow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
