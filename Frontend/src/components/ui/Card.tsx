import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: React.ElementType;
  children: React.ReactNode;
}

const paddingClasses = {
  none: '',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      hoverable = false,
      padding = 'md',
      as: Component = 'div',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        className={`bg-surface-card border border-border-subtle rounded-2xl transition-all duration-200 overflow-hidden
          ${hoverable ? 'hover:border-border-strong hover:shadow-xl hover:-translate-y-0.5' : 'shadow-sm'}
          ${paddingClasses[padding]}
          ${className}
        `}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`flex flex-col gap-1 pb-4 border-b border-border-subtle ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className = '', children, ...props }) => (
  <h3 className={`text-base sm:text-lg font-semibold text-foreground-primary tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className = '', children, ...props }) => (
  <p className={`text-xs sm:text-sm text-foreground-secondary ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`py-2 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`flex items-center justify-between pt-4 mt-2 border-t border-border-subtle ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
