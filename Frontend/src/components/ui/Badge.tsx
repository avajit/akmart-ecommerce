import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'saffron' | 'neutral';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, { bg: string; text: string; dot: string; border: string }> = {
  success: {
    bg: 'bg-emerald-950/50',
    text: 'text-emerald-300',
    dot: 'bg-emerald-400',
    border: 'border-emerald-500/30',
  },
  warning: {
    bg: 'bg-amber-950/50',
    text: 'text-amber-300',
    dot: 'bg-amber-400',
    border: 'border-amber-500/30',
  },
  error: {
    bg: 'bg-rose-950/50',
    text: 'text-rose-300',
    dot: 'bg-rose-400',
    border: 'border-rose-500/30',
  },
  info: {
    bg: 'bg-sky-950/50',
    text: 'text-sky-300',
    dot: 'bg-sky-400',
    border: 'border-sky-500/30',
  },
  saffron: {
    bg: 'bg-orange-950/60',
    text: 'text-orange-300',
    dot: 'bg-orange-400',
    border: 'border-orange-500/40',
  },
  neutral: {
    bg: 'bg-slate-800/60',
    text: 'text-slate-200',
    dot: 'bg-slate-400',
    border: 'border-slate-700/60',
  },
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
  md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  dot = false,
  icon,
  className = '',
  children,
  ...props
}) => {
  const styles = variantClasses[variant];

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-wide select-none ${styles.bg} ${styles.text} ${styles.border} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${styles.dot} shrink-0 animate-pulse`}
          aria-hidden="true"
        />
      )}
      {icon && <span className="inline-flex shrink-0 text-current" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
