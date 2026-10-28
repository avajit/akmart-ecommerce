import React from 'react';

export type ButtonVariant = 'primary' | 'saffron' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  // Primary: Deep Rust #C2410C with pure white text (6.25:1 WCAG AA contrast)
  primary: 'bg-brand-primary text-white hover:bg-brand-primary-hover active:bg-[#831843] border border-transparent shadow-sm',
  // Saffron: Vivid Saffron with dark #0D0D0D text (7.22:1 WCAG AAA contrast)
  saffron: 'bg-brand-saffron text-dark font-semibold hover:bg-brand-saffron-hover active:bg-[#EA580C] border border-transparent shadow-sm',
  // Secondary: Elevated dark slate surface
  secondary: 'bg-surface-card text-foreground-primary hover:bg-surface-elevated active:bg-surface-subtle border border-border-subtle shadow-sm',
  // Outline: Sleek border
  outline: 'bg-transparent text-foreground-primary hover:bg-surface-card/60 active:bg-surface-card border border-border-strong',
  // Ghost: Low emphasis
  ghost: 'bg-transparent text-foreground-secondary hover:text-foreground-primary hover:bg-surface-card/50 active:bg-surface-card border border-transparent',
  // Danger: High impact destructive
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 border border-transparent shadow-sm',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-xs sm:text-sm px-3 py-2 min-h-[44px] gap-1.5 rounded-lg',
  md: 'text-sm sm:text-base px-4 py-2.5 min-h-[44px] gap-2 rounded-xl',
  lg: 'text-base sm:text-lg px-6 py-3 min-h-[50px] gap-2.5 rounded-xl font-semibold',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      iconLeft,
      iconRight,
      fullWidth = false,
      disabled,
      className = '',
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        className={`relative inline-flex items-center justify-center font-medium transition-all duration-150 select-none
          focus-visible:ring-2 focus-visible:ring-brand-saffron focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base focus-visible:outline-none
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          ${isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'cursor-pointer hover:shadow-md active:scale-[0.99]'}
          ${className}
        `}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && iconLeft && <span className="inline-flex shrink-0" aria-hidden="true">{iconLeft}</span>}
        <span>{isLoading && loadingText ? loadingText : children}</span>
        {!isLoading && iconRight && <span className="inline-flex shrink-0" aria-hidden="true">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
