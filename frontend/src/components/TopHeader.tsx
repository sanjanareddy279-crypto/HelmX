import { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, LogOut, User, Settings as SettingsIcon } from 'lucide-react';
import type { AuthUser } from '@/services/auth';

interface TopHeaderProps {
  user: AuthUser;
  onSearch?: (query: string) => void;
  onLogout: () => void;
  onNavigateSettings: () => void;
}

export function TopHeader({ user, onSearch, onLogout, onNavigateSettings }: TopHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-ink-200/60">
      <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 h-16">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <span className="font-bold text-ink-900 text-sm">HelmX</span>
        </div>

        {/* Search bar */}
        <div className="relative flex-1 max-w-md hidden sm:block">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            onChange={(e) => onSearch?.(e.target.value)}
            placeholder="Search detections, history..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-ink-50 border border-ink-200/60 text-sm text-ink-700 placeholder-ink-400 focus:outline-none focus:border-primary-300 focus:bg-white focus:ring-2 focus:ring-primary-500/10 transition-all"
          />
        </div>

        <div className="flex-1 sm:flex-none" />

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-ink-50 transition-colors group">
          <Bell size={19} className="text-ink-500 group-hover:text-ink-700" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error-500 ring-2 ring-white" />
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-ink-50 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-ink-800 leading-tight">{user.name}</p>
              <p className="text-[10px] text-ink-400 leading-tight">{user.role}</p>
            </div>
            <ChevronDown
              size={15}
              className={`text-ink-400 hidden md:block transition-transform ${menuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white shadow-card-hover border border-ink-200/80 overflow-hidden animate-slide-up">
              {/* User info */}
              <div className="px-4 py-3 border-b border-ink-100">
                <p className="text-sm font-semibold text-ink-900">{user.name}</p>
                <p className="text-xs text-ink-400 mt-0.5">{user.email}</p>
              </div>

              {/* Menu items */}
              <div className="p-1.5">
                <DropdownItem icon={User} label="Profile" onClick={() => setMenuOpen(false)} />
                <DropdownItem icon={SettingsIcon} label="Settings" onClick={() => { setMenuOpen(false); onNavigateSettings(); }} />
              </div>

              {/* Logout */}
              <div className="p-1.5 border-t border-ink-100">
                <DropdownItem
                  icon={LogOut}
                  label="Logout"
                  danger
                  onClick={() => { setMenuOpen(false); onLogout(); }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function DropdownItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof LogOut;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        danger
          ? 'text-error-600 hover:bg-error-50'
          : 'text-ink-600 hover:bg-ink-50'
      }`}
    >
      <Icon size={16} className={danger ? 'text-error-500' : 'text-ink-400'} />
      {label}
    </button>
  );
}
