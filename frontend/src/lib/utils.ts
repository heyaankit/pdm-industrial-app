import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function statusColor(status: string): string {
  switch (status) {
    case 'Operational':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'Under Maintenance':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'Decommissioned':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function maintenanceColor(required: string): string {
  return required === 'Yes'
    ? 'bg-red-100 text-red-800 border-red-200'
    : 'bg-emerald-100 text-emerald-800 border-emerald-200';
}

export function confidenceColor(score: number): string {
  if (score >= 0.8) return 'text-emerald-600';
  if (score >= 0.6) return 'text-amber-600';
  return 'text-red-600';
}
