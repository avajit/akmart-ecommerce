import React from 'react';
import Button from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  retryLabel?: string;
  onRetry?: () => void;
  homeLabel?: string;
  onHome?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an unexpected error while loading this content. Please try again.',
  retryLabel = 'Try Again',
  onRetry,
  homeLabel = 'Back to Home',
  onHome,
  className = '',
}) => {
  return (
    <div
      className={`w-full max-w-md mx-auto py-12 px-6 flex flex-col items-center text-center animate-fadeIn ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="w-16 h-16 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-inner">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-foreground-primary mb-2 tracking-tight">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-foreground-secondary max-w-sm mb-6 leading-relaxed">
        {message}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        {onRetry && (
          <Button variant="primary" onClick={onRetry} className="w-full sm:w-auto">
            {retryLabel}
          </Button>
        )}
        {onHome && (
          <Button variant="outline" onClick={onHome} className="w-full sm:w-auto">
            {homeLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
