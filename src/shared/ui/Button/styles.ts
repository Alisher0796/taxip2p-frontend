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
