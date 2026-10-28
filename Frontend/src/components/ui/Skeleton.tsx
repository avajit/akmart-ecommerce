import React from 'react';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'card' | 'productCard';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  style = {},
  ...props
}) => {
  const customStyle: React.CSSProperties = {
    ...style,
    ...(width ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
  };

  const baseShimmer = `relative overflow-hidden bg-slate-800/40 rounded-xl
    before:absolute before:inset-0 before:-translate-x-full
    before:animate-[shimmer_1.5s_infinite]
    before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent`;

  if (variant === 'circular') {
    return (
      <div
        className={`${baseShimmer} rounded-full shrink-0 ${className}`}
        style={customStyle}
        aria-hidden="true"
        {...props}
      />
    );
  }

  if (variant === 'text') {
    return (
      <div
        className={`${baseShimmer} h-4 w-3/4 rounded-md my-1 ${className}`}
        style={customStyle}
        aria-hidden="true"
        {...props}
      />
    );
  }

  if (variant === 'productCard') {
    return (
      <div
        className={`bg-surface-card border border-border-subtle rounded-2xl p-3 flex flex-col gap-3 overflow-hidden ${className}`}
        aria-hidden="true"
        {...props}
      >
        <div className={`${baseShimmer} aspect-square w-full rounded-xl`} />
        <div className="flex flex-col gap-2 pt-1">
          <div className={`${baseShimmer} h-3.5 w-1/3 rounded`} />
          <div className={`${baseShimmer} h-4 w-4/5 rounded`} />
          <div className="flex items-center justify-between pt-2">
            <div className={`${baseShimmer} h-5 w-24 rounded`} />
            <div className={`${baseShimmer} h-8 w-8 rounded-full`} />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={`bg-surface-card border border-border-subtle rounded-2xl p-4 flex flex-col gap-4 ${className}`}
        aria-hidden="true"
        {...props}
      >
        <div className={`${baseShimmer} h-6 w-1/3 rounded`} />
        <div className={`${baseShimmer} h-24 w-full rounded-xl`} />
        <div className={`${baseShimmer} h-4 w-2/3 rounded`} />
      </div>
    );
  }

  return (
    <div
      className={`${baseShimmer} ${className}`}
      style={customStyle}
      aria-hidden="true"
      {...props}
    />
  );
};

export default Skeleton;
