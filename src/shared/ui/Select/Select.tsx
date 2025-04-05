import { forwardRef } from 'react'
import { cn } from '@/shared/lib/cn'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  className?: string
  containerClassName?: string
  options: Array<{
    value: string
    label: string
  }>
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, containerClassName, options, ...props }, ref) => {
    return (
      <div className={cn('space-y-2', containerClassName)}>
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full px-4 py-2 rounded-lg border transition-colors',
            'bg-white dark:bg-zinc-800',
            'text-gray-900 dark:text-white',
            'border-gray-300 dark:border-zinc-700',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
