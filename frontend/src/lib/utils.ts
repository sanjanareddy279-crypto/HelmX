import type { ComplianceStatus } from '@/types';

export function getComplianceStatus(value: number): ComplianceStatus {
  if (value >= 85) return 'safe';
  if (value >= 60) return 'warning';
  return 'danger';
}

export function statusColor(status: ComplianceStatus): {
  text: string;
  bg: string;
  border: string;
  dot: string;
  label: string;
} {
  switch (status) {
    case 'safe':
      return {
        text: 'text-success-700',
        bg: 'bg-success-50',
        border: 'border-success-200',
        dot: 'bg-success-500',
        label: 'Safe',
      };
    case 'warning':
      return {
        text: 'text-warning-700',
        bg: 'bg-warning-50',
        border: 'border-warning-200',
        dot: 'bg-warning-500',
        label: 'Warning',
      };
    case 'danger':
      return {
        text: 'text-error-700',
        bg: 'bg-error-50',
        border: 'border-error-200',
        dot: 'bg-error-500',
        label: 'Danger',
      };
  }
}

export function formatTime(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatTimeShort(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
