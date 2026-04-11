import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
}

const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    border: 'border-blue-100',
  },
  green: {
    bg: 'bg-emerald-50',
    icon: 'bg-emerald-100 text-emerald-600',
    border: 'border-emerald-100',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'bg-amber-100 text-amber-600',
    border: 'border-amber-100',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'bg-red-100 text-red-600',
    border: 'border-red-100',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-100 text-purple-600',
    border: 'border-purple-100',
  },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = 'blue',
}: StatCardProps) {
  const colors = colorMap[color];
  return (
    <div
      className={`rounded-xl border ${colors.border} ${colors.bg} p-5 transition-shadow hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${colors.icon}`}>{icon}</div>
      </div>
    </div>
  );
}
