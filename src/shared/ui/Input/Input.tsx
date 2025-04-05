import { forwardRef } from 'react'
import { cn } from '@/shared/lib/cn'

export interface BaseProps {
  label?: string
  error?: string
  className?: string
  containerClassName?: string
}

export interface InputProps extends BaseProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {}
export interface TextareaProps extends BaseProps, Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {}

const InputComponent = forwardRef<HTMLInputElement, InputProps>((
  { label, error, className, containerClassName, ...props }, 
  ref
) => (
  <div className={cn('space-y-2', containerClassName)}>
    {label && (
      <label
        htmlFor={props.id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
    )}
    <input
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
    />
    {error && (
      <p className="text-sm text-red-500">{error}</p>
    )}
  </div>
))

const TextareaComponent = forwardRef<HTMLTextAreaElement, TextareaProps>((
  { label, error, className, containerClassName, ...props }, 
  ref
) => (
  <div className={cn('space-y-2', containerClassName)}>
    {label && (
      <label
        htmlFor={props.id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
    )}
    <textarea
      ref={ref}
      className={cn(
        'w-full px-4 py-2 rounded-lg border transition-colors',
        'bg-white dark:bg-zinc-800',
        'text-gray-900 dark:text-white',
        'border-gray-300 dark:border-zinc-700',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'resize-none min-h-[100px]',
        error && 'border-red-500 focus:ring-red-500',
        className
      )}
      {...props}
    />
    {error && (
      <p className="text-sm text-red-500">{error}</p>
    )}
  </div>
))

InputComponent.displayName = 'Input'
TextareaComponent.displayName = 'Textarea'

export const Input = InputComponent as {
  <T extends InputProps>(props: T & { ref?: React.ForwardedRef<HTMLInputElement> }): JSX.Element
  displayName: string
}

export const Textarea = TextareaComponent as {
  <T extends TextareaProps>(props: T & { ref?: React.ForwardedRef<HTMLTextAreaElement> }): JSX.Element
  displayName: string
}
