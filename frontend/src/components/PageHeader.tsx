import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  badge?: string;
}

export function PageHeader({ title, subtitle, icon: Icon, badge }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
          <Icon size={24} className="text-primary-600" strokeWidth={2.5} />
        </div>
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-ink-900 tracking-tight">{title}</h1>
          {badge && (
            <span className="px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 text-[10px] font-semibold uppercase tracking-wider">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-ink-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}
