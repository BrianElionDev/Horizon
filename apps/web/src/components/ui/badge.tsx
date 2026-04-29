import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]',
        secondary: 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]',
        destructive: 'bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]',
        outline: 'border border-[hsl(var(--border))] text-[hsl(var(--foreground))]',
        'status-new': 'bg-[hsl(var(--status-new)/0.15)] text-[hsl(var(--status-new))]',
        'status-exploring': 'bg-[hsl(var(--status-exploring)/0.15)] text-[hsl(var(--status-exploring))]',
        'status-validated': 'bg-[hsl(var(--status-validated)/0.15)] text-[hsl(var(--status-validated))]',
        'status-archived': 'bg-[hsl(var(--status-archived)/0.15)] text-[hsl(var(--status-archived))]',
        'status-dismissed': 'bg-[hsl(var(--status-dismissed)/0.15)] text-[hsl(var(--status-dismissed))]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
