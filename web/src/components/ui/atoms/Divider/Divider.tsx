import React from 'react'
import { cn } from '@/utils'

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
  label?: string
}

export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ orientation = 'horizontal', label, className, ...props }, ref) => {
    if (orientation === 'vertical') {
      return <div ref={ref} className={cn('w-px bg-neutral-200', className)} {...props} />
    }

    if (label) {
      return (
        <div ref={ref} className={cn('flex items-center gap-4', className)} {...props}>
          <div className="h-px flex-1 bg-neutral-200" />
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{label}</span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>
      )
    }

    return <div ref={ref} className={cn('h-px bg-neutral-200', className)} {...props} />
  }
)

Divider.displayName = 'Divider'
