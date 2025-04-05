import { cn } from '@/shared/lib/utils';
import { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        'rounded-lg font-medium transition-colors disabled:opacity-50',
        {
          // Variants
          'bg-yellow-400 text-black hover:bg-yellow-500': variant === 'primary',
          'bg-blue-500 text-white hover:bg-blue-600': variant === 'secondary',
          'border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-50': variant === 'outline',
          'bg-red-500 text-white hover:bg-red-600': variant === 'danger',
          
          // Sizes
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
          
          // States
          'cursor-not-allowed': disabled || isLoading,
        },
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Загрузка...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};
