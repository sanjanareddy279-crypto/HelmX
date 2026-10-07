import type { ComplianceStatus } from '@/types';
import { statusColor } from '@/lib/utils';

interface StatusBadgeProps {
  status: ComplianceStatus;
  label?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const c = statusColor(status);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${c.bg} ${c.border} ${c.text} ${sizeClasses} font-semibold`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {label || c.label}
    </span>
  );
}
