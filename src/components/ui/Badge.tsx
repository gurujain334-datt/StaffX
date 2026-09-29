import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'yellow' | 'red' | 'gray' | 'indigo' | 'blue' | 'purple';
  className?: string;
  icon?: React.ReactNode;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gray',
  className = '',
  icon,
  dot = false,
}) => {
  const variantStyles = {
    green: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60',
    yellow: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
    red: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60',
    gray: 'bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-700/80',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60',
    blue: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60',
    purple: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60',
  };

  const dotStyles = {
    green: 'bg-emerald-500',
    yellow: 'bg-amber-500',
    red: 'bg-rose-500',
    gray: 'bg-slate-400',
    indigo: 'bg-indigo-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-tight border ${variantStyles[variant]} ${className}`}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotStyles[variant]}`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotStyles[variant]}`} />
        </span>
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="whitespace-nowrap">{children}</span>
    </span>
  );
};

export interface StatusBadgeProps {
  status?: string | null;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const safeStatus = status || 'UNKNOWN';
  const normalized = safeStatus.toUpperCase().replace(/\s+/g, '_');

  let variant: BadgeProps['variant'] = 'gray';
  let label = safeStatus.replace(/_/g, ' ');
  let dot = false;

  // Green
  if (['VERIFIED', 'ACCEPTED', 'PAID', 'PRESENT', 'ACTIVE', 'CHECKED_IN', 'CONFIRMED'].includes(normalized)) {
    variant = 'green';
    dot = ['PRESENT', 'ACTIVE', 'CHECKED_IN'].includes(normalized);
  }
  // Yellow / Amber
  else if (['PENDING', 'UNDER_REVIEW', 'PAYMENT_PENDING', 'SHORTLISTED'].includes(normalized)) {
    variant = 'yellow';
  }
  // Red
  else if (['REJECTED', 'FAILED', 'CANCELLED', 'SUSPENDED', 'ABSENT'].includes(normalized)) {
    variant = 'red';
  }
  // Gray
  else if (['DRAFT', 'CLOSED', 'EXPIRED', 'NOT_CHECKED_IN', 'UNVERIFIED', 'CHECKED_OUT', 'WITHDRAWN'].includes(normalized)) {
    variant = 'gray';
  }
  // Indigo
  else if (['PUBLISHED', 'FILLED', 'COMPLETED'].includes(normalized)) {
    variant = 'indigo';
  }

  return (
    <Badge variant={variant} dot={dot} className={`capitalize ${className}`}>
      {label.toLowerCase()}
    </Badge>
  );
};
