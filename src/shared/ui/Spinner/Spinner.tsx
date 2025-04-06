import { cn } from '@/shared/lib/cn';
import { spinnerSizes, SpinnerSize } from './styles';

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
