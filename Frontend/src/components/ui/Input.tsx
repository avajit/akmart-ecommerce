import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      iconLeft,
      iconRight,
      fullWidth = true,
      id,
      name,
      required,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    // Generate unique ID for label / aria-describedby association
    const generatedId = React.useId();
    const inputId = id || (name ? `input-${name}` : `input-${generatedId}`);
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

    return (
      <div className={`${fullWidth ? 'w-full' : 'inline-block'} flex flex-col gap-1.5`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs sm:text-sm font-medium text-foreground-primary flex items-center justify-between"
          >
            <span>
              {label}
              {required && <span className="text-red-400 ml-1" aria-hidden="true">*</span>}
            </span>
          </label>
        )}

        <div className="relative flex items-center">
          {iconLeft && (
            <div className="absolute left-3.5 text-foreground-secondary pointer-events-none flex items-center">
              {iconLeft}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            name={name}
            required={required}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-[16px] bg-surface-card text-foreground-primary placeholder-foreground-muted border transition-all duration-150
              focus-visible:ring-2 focus-visible:ring-brand-saffron focus-visible:ring-offset-1 focus-visible:ring-offset-surface-base focus-visible:outline-none
              ${iconLeft ? 'pl-10' : ''}
              ${iconRight ? 'pr-10' : ''}
              ${error ? 'border-red-500 focus-visible:border-red-500' : 'border-border-subtle focus-visible:border-brand-saffron hover:border-border-strong'}
              ${disabled ? 'opacity-50 cursor-not-allowed bg-surface-subtle' : ''}
              ${className}
            `}
            {...props}
          />

          {iconRight && (
            <div className="absolute right-3.5 text-foreground-secondary flex items-center">
              {iconRight}
            </div>
          )}
        </div>

        {error && (
          <p id={errorId} role="alert" className="text-xs text-red-400 flex items-center gap-1 mt-0.5">
            <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </p>
        )}

        {!error && helperText && (
          <p id={helperId} className="text-xs text-foreground-secondary mt-0.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
