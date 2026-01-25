import React from 'react'
import { cn } from '@/utils'

export interface HeaderLeftProps {
  children: React.ReactNode
  className?: string
}

export const HeaderLeft = React.forwardRef<HTMLDivElement, HeaderLeftProps>(
  ({ children, className }, ref) => {
    return (
      <div ref={ref} className={cn('flex items-center gap-4', className)}>
        {children}
      </div>
    )
  }
)

HeaderLeft.displayName = 'HeaderLeft'
