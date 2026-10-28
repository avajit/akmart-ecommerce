import React from 'react';

export interface QuantityStepperProps {
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
  className?: string;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  size = 'md',
  ariaLabel = 'Quantity',
  className = '',
}) => {
  const isMin = value <= min;
  const isMax = value >= max;

  const handleDecrement = () => {
    if (!isMin && !disabled) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (!isMax && !disabled) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(parsed, max));
      onChange(clamped);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrement();
    }
  };

  return (
    <div
      className={`inline-flex items-center bg-surface-card border border-border-subtle rounded-xl p-1 shadow-sm ${className}`}
    >
      {/* Minus Button - strictly 44x44px touch target */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={isMin || disabled}
        aria-label={`Decrease ${ariaLabel}`}
        className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-foreground-primary hover:bg-surface-elevated active:bg-surface-subtle transition-colors disabled:opacity-30 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-brand-saffron focus-visible:outline-none"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
        </svg>
      </button>

      {/* Value Input */}
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        role="spinbutton"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={ariaLabel}
        className="w-12 h-11 text-center font-semibold text-foreground-primary bg-transparent text-[16px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-saffron rounded"
      />

      {/* Plus Button - strictly 44x44px touch target */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={isMax || disabled}
        aria-label={`Increase ${ariaLabel}`}
        className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-foreground-primary hover:bg-surface-elevated active:bg-surface-subtle transition-colors disabled:opacity-30 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-brand-saffron focus-visible:outline-none"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};

export default QuantityStepper;
