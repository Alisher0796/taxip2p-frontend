import { forwardRef, useId } from 'react';
import { cn } from '@/shared/lib/cn';

const baseInputStyles = {
  container: 'space-y-2',
  label: 'block text-sm font-medium text-gray-700 dark:text-gray-300',
  input: cn(
    'w-full px-4 py-2 rounded-lg border transition-colors',
    'bg-white dark:bg-zinc-800',
    'text-gray-900 dark:text-white',
    'border-gray-300 dark:border-zinc-700',
    'focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ),
  error: 'text-sm text-red-500 mt-1',
};

export interface BaseProps {
  /** Label text for the input */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Additional class names for the input element */
  className?: string;
  /** Additional class names for the container */
  containerClassName?: string;
  /** Description text for the input */
  description?: string;
}

export interface InputProps extends BaseProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {}
export interface TextareaProps extends BaseProps, Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {}

const InputComponent = forwardRef<HTMLInputElement, InputProps>((
  { 
    label, 
    error, 
    className, 
    containerClassName, 
    description,
    id: providedId,
    'aria-describedby': describedBy,
    ...props 
  }, 
  ref
) => {
  const id = providedId || useId();
  const errorId = error ? `${id}-error` : undefined;
  const descriptionId = description ? `${id}-description` : undefined;
  const ariaDescribedBy = cn(describedBy, errorId, descriptionId);

  return (
    <div className={cn(baseInputStyles.container, containerClassName)}>
      {label && (
        <label
          htmlFor={id}
          className={baseInputStyles.label}
        >
          {label}
        </label>
      )}
      {description && (
        <p 
          id={descriptionId}
          className="text-sm text-muted-foreground"
        >
          {description}
        </p>
      )}
      <input
        ref={ref}
        id={id}
        aria-invalid={!!error}
        aria-describedby={ariaDescribedBy || undefined}
        className={cn(
          baseInputStyles.input,
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p 
          id={errorId}
          className={baseInputStyles.error}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});

const TextareaComponent = forwardRef<HTMLTextAreaElement, TextareaProps>((
  { 
    label, 
    error, 
    className, 
    containerClassName, 
    description,
    id: providedId,
    'aria-describedby': describedBy,
    ...props 
  }, 
  ref
) => {
  const id = providedId || useId();
  const errorId = error ? `${id}-error` : undefined;
  const descriptionId = description ? `${id}-description` : undefined;
  const ariaDescribedBy = cn(describedBy, errorId, descriptionId);

  return (
    <div className={cn(baseInputStyles.container, containerClassName)}>
      {label && (
        <label
          htmlFor={id}
          className={baseInputStyles.label}
        >
          {label}
        </label>
      )}
      {description && (
        <p 
          id={descriptionId}
          className="text-sm text-muted-foreground"
        >
          {description}
        </p>
      )}
      <textarea
        ref={ref}
        id={id}
        aria-invalid={!!error}
        aria-describedby={ariaDescribedBy || undefined}
        className={cn(
          baseInputStyles.input,
          'resize-none min-h-[100px]',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p 
          id={errorId}
          className={baseInputStyles.error}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});

InputComponent.displayName = 'Input';
TextareaComponent.displayName = 'Textarea';

export const Input = InputComponent as {
  <T extends InputProps>(props: T & { ref?: React.ForwardedRef<HTMLInputElement> }): JSX.Element;
  displayName: string;
};

export const Textarea = TextareaComponent as {
  <T extends TextareaProps>(props: T & { ref?: React.ForwardedRef<HTMLTextAreaElement> }): JSX.Element;
  displayName: string;
};
