import { cn } from '@/shared/lib/cn';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export const buttonVariants = {
  primary: 'bg-yellow-400 text-black hover:bg-yellow-500 active:bg-yellow-600',
  secondary: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700',
  outline: 'border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-50 active:bg-yellow-100',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
} as const;

export const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
} as const;

export type ButtonVariant = keyof typeof buttonVariants;
export type ButtonSize = keyof typeof buttonSizes;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant that determines its visual style */
  variant?: ButtonVariant;
  /** Button size that determines its dimensions */
  size?: ButtonSize;
  /** Whether the button is in a loading state */
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    className,
    disabled,
    children,
    type = 'button',
    ...props
  },
  ref
) => {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      disabled={disabled || isLoading}
      aria-disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center space-x-2" role="status" aria-live="polite">
          <div 
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
          <span>Загрузка...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
});

Button.displayName = 'Button';
