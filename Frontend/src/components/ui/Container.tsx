import React from 'react';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  as?: React.ElementType;
}

const sizeClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-[1536px]',
  full: 'max-w-full',
};

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'lg',
  className = '',
  as: Component = 'div',
  ...props
}) => {
  return (
    <Component
      className={`w-full mx-auto px-3.5 sm:px-6 lg:px-8 ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Container;
