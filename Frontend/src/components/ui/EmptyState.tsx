import React from 'react';
import Button from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`w-full max-w-md mx-auto py-12 px-6 flex flex-col items-center text-center animate-fadeIn ${className}`}
      role="region"
      aria-label={title}
    >
      <div className="w-16 h-16 rounded-2xl bg-surface-card border border-border-subtle flex items-center justify-center text-brand-saffron shadow-inner mb-4">
        {icon || (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        )}
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-foreground-primary mb-2 tracking-tight">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-foreground-secondary max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {actionLabel && onAction && (
            <Button variant="primary" onClick={onAction} className="w-full sm:w-auto">
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outline" onClick={onSecondaryAction} className="w-full sm:w-auto">
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
