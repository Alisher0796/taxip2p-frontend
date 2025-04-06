import { forwardRef, useId } from 'react';
import { cn } from '@/shared/lib/cn';

const baseSelectStyles = {
  container: 'space-y-2',
  label: 'block text-sm font-medium text-gray-700 dark:text-gray-300',
  select: cn(
    'w-full px-4 py-2 rounded-lg border transition-colors appearance-none',
    'bg-white dark:bg-zinc-800',
    'text-gray-900 dark:text-white',
    'border-gray-300 dark:border-zinc-700',
    'focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E")] bg-[length:20px_20px] bg-[right_16px_center] bg-no-repeat pr-12'
  ),
  error: 'text-sm text-red-500 mt-1',
};

export type SelectOption = {
  /** The value to be submitted in forms */
  value: string;
  /** The text shown in the select */
  label: string;
  /** Whether this option is disabled */
  disabled?: boolean;
};

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  /** Label text for the select */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Additional class names for the select element */
  className?: string;
  /** Additional class names for the container */
  containerClassName?: string;
  /** Description text for the select */
  description?: string;
  /** Array of options for the select */
  options: SelectOption[];
  /** Optional placeholder text when no option is selected */
  placeholder?: string;
}

const SelectComponent = forwardRef<HTMLSelectElement, SelectProps>((
  { 
    label, 
    error, 
    className, 
    containerClassName, 
    description,
    options,
    placeholder,
    id,
    required,
    'aria-describedby': describedBy,
    ...props 
  }, 
  ref
) => {
  const errorId = error ? `${id}-error` : undefined;
  const descriptionId = description ? `${id}-description` : undefined;
  const ariaDescribedBy = cn(describedBy, errorId, descriptionId);

  return (
    <div className={cn(baseSelectStyles.container, containerClassName)}>
      {label && (
        <label
          htmlFor={id}
          className={baseSelectStyles.label}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
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
      <select
        ref={ref}
        id={id}
        aria-invalid={!!error}
        aria-describedby={ariaDescribedBy || undefined}
        className={cn(
          baseSelectStyles.select,
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p 
          id={errorId}
          className={baseSelectStyles.error}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});

SelectComponent.displayName = 'Select';

export const Select = forwardRef<HTMLSelectElement, SelectProps>((props, ref) => {
  const generatedId = useId();
  return <SelectComponent {...props} id={props.id || generatedId} ref={ref} />;
});

Select.displayName = 'Select';
