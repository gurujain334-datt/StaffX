import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverEffect?: boolean;
  variant?: 'default' | 'glass' | 'subtle';
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  hoverEffect = false,
  variant = 'default',
  className = '',
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const variantStyles = {
    default: 'bg-slate-900 border border-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.4)] text-slate-100',
    glass: 'bg-slate-900/75 backdrop-blur-md border border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.5)] text-slate-100',
    subtle: 'bg-slate-900/40 border border-slate-800/70 text-slate-100',
  };

  return (
    <div
      className={`rounded-xl transition-all duration-200 ${variantStyles[variant]} ${
        hoverEffect ? 'hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:border-slate-700 hover:-translate-y-0.5' : ''
      } ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

