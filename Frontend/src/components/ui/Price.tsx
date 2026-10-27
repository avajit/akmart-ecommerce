import React from 'react';

export type PriceSize = 'sm' | 'md' | 'lg' | 'xl';

export interface PriceProps extends React.HTMLAttributes<HTMLDivElement> {
  amount: number;
  originalPrice?: number;
  currency?: string;
  size?: PriceSize;
  showDiscountBadge?: boolean;
  highlight?: boolean;
}

const sizeClasses: Record<PriceSize, { current: string; original: string; badge: string }> = {
  sm: {
    current: 'text-sm font-semibold',
    original: 'text-xs',
    badge: 'text-[10px] px-1.5 py-0.2',
  },
  md: {
    current: 'text-base sm:text-lg font-bold',
    original: 'text-xs sm:text-sm',
    badge: 'text-xs px-2 py-0.5',
  },
  lg: {
    current: 'text-xl sm:text-2xl font-extrabold',
    original: 'text-sm sm:text-base',
    badge: 'text-xs px-2.5 py-0.5',
  },
  xl: {
    current: 'text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight',
    original: 'text-base sm:text-lg',
    badge: 'text-xs sm:text-sm px-2.5 py-1',
  },
};

/**
 * Format number into South Asian Lakh / Crore system (e.g. 1,25,000)
 */
export function formatSouthAsianNumber(val: number): string {
  if (isNaN(val)) return '0';
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(val);
}

export const Price: React.FC<PriceProps> = ({
  amount,
  originalPrice,
  currency = 'Rs.',
  size = 'md',
  showDiscountBadge = true,
  highlight = false,
  className = '',
  ...props
}) => {
  const currentFormatted = formatSouthAsianNumber(amount);
  const originalFormatted = originalPrice ? formatSouthAsianNumber(originalPrice) : null;
  const discountPercent =
    originalPrice && originalPrice > amount
      ? Math.round(((originalPrice - amount) / originalPrice) * 100)
      : null;

  const styles = sizeClasses[size];

  // Screen reader description
  const ariaDescription = originalFormatted && discountPercent
    ? `Price: ${currency} ${currentFormatted}, original price ${currency} ${originalFormatted}, ${discountPercent} percent discount`
    : `Price: ${currency} ${currentFormatted}`;

  return (
    <div
      className={`inline-flex items-baseline flex-wrap gap-x-2 gap-y-1 ${className}`}
      aria-label={ariaDescription}
      {...props}
    >
      {/* Current Price */}
      <span
        className={`font-sans tracking-tight ${styles.current} ${
          highlight ? 'text-brand-saffron' : 'text-foreground-primary'
        }`}
      >
        <span className="text-xs sm:text-sm font-medium mr-1 text-foreground-secondary">{currency}</span>
        {currentFormatted}
      </span>

      {/* Strike-through MRP */}
      {originalFormatted && originalPrice! > amount && (
        <span
          className={`line-through text-foreground-muted font-normal ${styles.original}`}
          aria-hidden="true"
        >
          {currency} {originalFormatted}
        </span>
      )}

      {/* Discount Badge */}
      {showDiscountBadge && discountPercent && discountPercent > 0 && (
        <span
          className={`font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-500/30 rounded-md select-none shrink-0 ${styles.badge}`}
          aria-hidden="true"
        >
          {discountPercent}% OFF
        </span>
      )}
    </div>
  );
};

export default Price;
