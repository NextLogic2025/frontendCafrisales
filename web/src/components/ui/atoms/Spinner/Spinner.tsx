import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils'

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  text?: string
}

const spinnerSizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', color = 'text-red', text, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex items-center justify-center gap-2', className)} {...props}>
        <Loader2 className={cn('animate-spin', spinnerSizes[size], color)} />
        {text && <span className="text-sm text-neutral-600">{text}</span>}
      </div>
    )
  }
)

Spinner.displayName = 'Spinner'
