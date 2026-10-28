import React from 'react';

export type RatingSize = 'sm' | 'md' | 'lg';

export interface RatingProps extends React.HTMLAttributes<HTMLDivElement> {
  rating: number; // 0 to 5
  maxRating?: number;
  reviewCount?: number;
  size?: RatingSize;
  showScore?: boolean;
}

const sizeClasses: Record<RatingSize, { star: string; text: string }> = {
  sm: { star: 'w-3.5 h-3.5', text: 'text-xs' },
  md: { star: 'w-4 h-4', text: 'text-xs sm:text-sm' },
  lg: { star: 'w-5 h-5', text: 'text-sm sm:text-base' },
};

export const Rating: React.FC<RatingProps> = ({
  rating,
  maxRating = 5,
  reviewCount,
  size = 'md',
  showScore = true,
  className = '',
  ...props
}) => {
  const clampedRating = Math.max(0, Math.min(rating, maxRating));
  const fullStars = Math.floor(clampedRating);
  const hasHalfStar = clampedRating - fullStars >= 0.3 && clampedRating - fullStars <= 0.7;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  const ariaDescription = reviewCount !== undefined
    ? `${clampedRating.toFixed(1)} out of ${maxRating} stars from ${reviewCount} reviews`
    : `${clampedRating.toFixed(1)} out of ${maxRating} stars`;

  const styles = sizeClasses[size];

  return (
    <div
      className={`inline-flex items-center gap-1.5 ${className}`}
      role="img"
      aria-label={ariaDescription}
      {...props}
    >
      <div className="flex items-center text-amber-400 gap-0.5" aria-hidden="true">
        {/* Full Stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <svg key={`full-${i}`} className={`${styles.star} fill-current`} viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}

        {/* Half Star */}
        {hasHalfStar && (
          <svg className={`${styles.star} fill-current`} viewBox="0 0 20 20">
            <defs>
              <linearGradient id="half-star-grad">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#475569" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <path
              fill="url(#half-star-grad)"
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
        )}

        {/* Empty Stars */}
        {Array.from({ length: Math.max(0, emptyStars) }).map((_, i) => (
          <svg key={`empty-${i}`} className={`${styles.star} text-slate-600 fill-current`} viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {showScore && (
        <span className={`font-semibold text-foreground-primary ${styles.text}`} aria-hidden="true">
          {clampedRating.toFixed(1)}
        </span>
      )}

      {reviewCount !== undefined && (
        <span className={`text-foreground-secondary ${styles.text}`} aria-hidden="true">
          ({new Intl.NumberFormat('en-IN').format(reviewCount)})
        </span>
      )}
    </div>
  );
};

export default Rating;
