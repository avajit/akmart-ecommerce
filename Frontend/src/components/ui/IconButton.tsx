import React from 'react';

export type IconButtonVariant = 'ghost' | 'secondary' | 'outline' | 'primary' | 'saffron' | 'danger';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string; // Enforce accessible label
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  rounded?: 'full' | 'xl' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<IconButtonVariant, string> = {
  ghost: 'bg-transparent text-foreground-secondary hover:text-foreground-primary hover:bg-surface-card/60 active:bg-surface-card border border-transparent',
  secondary: 'bg-surface-card text-foreground-primary hover:bg-surface-elevated active:bg-surface-subtle border border-border-subtle shadow-sm',
  outline: 'bg-transparent text-foreground-primary hover:bg-surface-card/60 active:bg-surface-card border border-border-strong',
  primary: 'bg-brand-primary text-white hover:bg-brand-primary-hover active:bg-[#831843] border border-transparent shadow-sm',
  saffron: 'bg-brand-saffron text-dark hover:bg-brand-saffron-hover active:bg-[#EA580C] border border-transparent shadow-sm',
  danger: 'bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/20 active:bg-red-700',
};

const sizeClasses: Record<IconButtonSize, string> = {
  // All sizes maintain at least 44x44px touch bounding box (WCAG 2.2 AA SC 2.5.8)
  sm: 'w-11 h-11 min-w-[44px] min-h-[44px] text-base',
  md: 'w-11 h-11 min-w-[44px] min-h-[44px] text-lg',
  lg: 'w-12 h-12 min-w-[48px] min-h-[48px] text-xl',
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      'aria-label': ariaLabel,
      variant = 'ghost',
      size = 'md',
      rounded = 'full',
      isLoading = false,
      disabled,
      className = '',
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;
    const roundedClass = rounded === 'full' ? 'rounded-full' : rounded === 'xl' ? 'rounded-xl' : 'rounded-lg';

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        aria-label={ariaLabel}
        title={props.title || ariaLabel}
        className={`relative inline-flex items-center justify-center transition-all duration-150 select-none
          focus-visible:ring-2 focus-visible:ring-brand-saffron focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base focus-visible:outline-none
          ${roundedClass}
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'cursor-pointer hover:scale-105 active:scale-95'}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          children
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
export default IconButton;
