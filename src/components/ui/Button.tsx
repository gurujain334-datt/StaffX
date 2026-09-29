import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer tracking-tight';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 h-8 gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2 h-9 sm:h-10 gap-2',
    lg: 'text-sm sm:text-base px-5 sm:px-6 py-2.5 sm:py-3 h-11 sm:h-12 gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary: 'theme-accent-bg theme-accent-hover text-white theme-accent-glow ring-1 ring-white/20 active:translate-y-[1px] transition-all',
    secondary: 'bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-100 border border-slate-200/90 dark:border-slate-700 focus:ring-slate-400 active:translate-y-[1px]',
    outline: 'border border-slate-300 dark:border-slate-700 bg-slate-900/80 hover:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-400 dark:hover:border-slate-600 focus:ring-indigo-500 active:translate-y-[1px]',
    destructive: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm active:translate-y-[1px]',
    ghost: 'bg-transparent hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-100 dark:hover:text-white focus:ring-slate-300 dark:focus:ring-slate-700',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_1px_2px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.2)] ring-1 ring-emerald-700/40 hover:shadow-[0_4px_12px_rgba(5,150,105,0.25)] focus:ring-emerald-500 active:translate-y-[1px]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {!isLoading && icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
