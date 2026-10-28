import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCount?: boolean;
  maxLength?: number;
  fullWidth?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      showCount = false,
      maxLength,
      fullWidth = true,
      id,
      name,
      required,
      disabled,
      className = '',
      value,
      defaultValue,
      onChange,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || (name ? `textarea-${name}` : `textarea-${generatedId}`);
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

    const [charCount, setCharCount] = React.useState<number>(() => {
      if (typeof value === 'string') return value.length;
      if (typeof defaultValue === 'string') return defaultValue.length;
      return 0;
    });

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      if (onChange) onChange(e);
    };

    return (
      <div className={`${fullWidth ? 'w-full' : 'inline-block'} flex flex-col gap-1.5`}>
        {label && (
          <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-foreground-primary">
            <label htmlFor={inputId}>
              {label}
              {required && <span className="text-red-400 ml-1" aria-hidden="true">*</span>}
            </label>
            {showCount && maxLength && (
              <span className="text-xs text-foreground-secondary">
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        )}

        <textarea
          ref={ref}
          id={inputId}
          name={name}
          rows={rows}
          maxLength={maxLength}
          required={required}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`w-full min-h-[96px] px-3.5 py-2.5 rounded-xl text-[16px] bg-surface-card text-foreground-primary placeholder-foreground-muted border transition-all duration-150 resize-y
            focus-visible:ring-2 focus-visible:ring-brand-saffron focus-visible:ring-offset-1 focus-visible:ring-offset-surface-base focus-visible:outline-none
            ${error ? 'border-red-500 focus-visible:border-red-500' : 'border-border-subtle focus-visible:border-brand-saffron hover:border-border-strong'}
            ${disabled ? 'opacity-50 cursor-not-allowed bg-surface-subtle' : ''}
            ${className}
          `}
          {...props}
        />

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

Textarea.displayName = 'Textarea';
export default Textarea;
