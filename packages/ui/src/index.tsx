import React from 'react';

// Design Tokens
export const THEME_COLORS = {
  primary: '#25D366',       // WhatsApp Green
  primaryDark: '#128C7E',   // WhatsApp Teal/Dark Green
  primaryLight: '#DCF8C6',  // WhatsApp Chat Bubble Light Green
  navySidebar: '#0F172A',   // Dark Navy Sidebar
  navySidebarHover: '#1E293B',
  surfaceLight: '#F8FAFC',
  borderLight: '#E2E8F0',
};

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon,
  subtitle,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        {icon && <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-lg">{icon}</div>}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">{value}</h3>
        {change && (
          <span
            className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
              isPositive
                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300'
            }`}
          >
            {change}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>}
    </div>
  );
};

export interface BadgeProps {
  status: string;
  variant?: 'green' | 'blue' | 'yellow' | 'red' | 'gray';
  children?: React.ReactNode;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, variant, children }) => {
  const getStyle = () => {
    switch (variant || status.toLowerCase()) {
      case 'approved':
      case 'connected':
      case 'delivered':
      case 'read':
      case 'active':
      case 'opted_in':
      case 'green':
        return 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30';
      case 'pending':
      case 'pending_verification':
      case 'scheduled':
      case 'processing':
      case 'yellow':
        return 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30';
      case 'failed':
      case 'rejected':
      case 'disconnected':
      case 'restricted':
      case 'opted_out':
      case 'red':
        return 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30';
      case 'draft':
      case 'paused':
      case 'resolved':
      case 'gray':
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyle()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {children || status}
    </span>
  );
};

export interface WhatsAppIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const WhatsAppIcon: React.FC<WhatsAppIconProps> = ({
  className = 'w-5 h-5',
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12 2.5A9.5 9.5 0 1 0 19.42 17.94a1.65 1.65 0 0 0-2.58-2.06A6.2 6.2 0 1 1 16.84 8.12a1.65 1.65 0 1 0 2.58-2.06A9.46 9.46 0 0 0 12 2.5Z" />
      <path d="M11.75 9.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Zm7.5 0a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Zm-6.5 1.35h5.5v1.8h-5.5v-1.8Z" />
    </svg>
  );
};


