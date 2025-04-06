import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export const cardVariants = {
  default: 'bg-card text-card-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
} as const;

export type CardVariant = keyof typeof cardVariants;

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  asChild?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>((
  { className, variant = 'default', asChild = false, ...props }, 
  ref
) => {
  const Comp = asChild ? 'div' : 'article';
  
  return (
    <Comp
      ref={ref}
      className={cn(
        'rounded-xl shadow-sm transition-colors',
        'focus-within:ring-2 focus-within:ring-yellow-400 focus-within:ring-offset-2',
        cardVariants[variant],
        className
      )}
      {...props}
    />
  );
});

Card.displayName = 'Card';

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>((
  { className, asChild = false, ...props }, 
  ref
) => {
  const Comp = asChild ? 'div' : 'header';
  
  return (
    <Comp
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  );
});

CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>((
  { className, as: Comp = 'h3', ...props }, 
  ref
) => (
  <Comp
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));

CardTitle.displayName = 'CardTitle';

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  asChild?: boolean;
}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>((
  { className, asChild = false, ...props }, 
  ref
) => {
  const Comp = asChild ? 'div' : 'p';
  
  return (
    <Comp
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
});

CardDescription.displayName = 'CardDescription';

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>((
  { className, asChild = false, ...props }, 
  ref
) => {
  const Comp = asChild ? 'div' : 'section';
  
  return (
    <Comp 
      ref={ref} 
      className={cn('p-6 pt-0', className)} 
      {...props} 
    />
  );
});

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>((
  { className, asChild = false, ...props }, 
  ref
) => {
  const Comp = asChild ? 'div' : 'footer';
  
  return (
    <Comp
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  );
});

CardFooter.displayName = 'CardFooter';
