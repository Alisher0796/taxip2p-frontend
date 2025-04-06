export const cardVariants = {
  default: 'bg-card text-card-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
} as const;

export type CardVariant = keyof typeof cardVariants;
