import { cn } from '@/shared/lib/cn';

export const spinnerSizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
} as const;

export type SpinnerSize = keyof typeof spinnerSizes;

export interface SpinnerProps {
  /** Size of the spinner */
  size?: SpinnerSize;
  /** Additional class names */
  className?: string;
  /** Text shown to screen readers */
  srText?: string;
}

export const Spinner = ({
  size = 'md',
  className,
  srText = 'Загрузка...',
}: SpinnerProps) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('inline-flex', className)}
    >
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-current border-t-transparent',
          spinnerSizes[size]
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{srText}</span>
    </div>
  );
};

Spinner.displayName = 'Spinner';
