import React from 'react'
import { cn } from '@/utils'

export interface HeaderRightProps {
  children: React.ReactNode
  className?: string
}

export const HeaderRight = React.forwardRef<HTMLDivElement, HeaderRightProps>(
  ({ children, className }, ref) => {
    return (
      <div ref={ref} className={cn('flex items-center gap-3', className)}>
        {children}
      </div>
    )
  }
)

HeaderRight.displayName = 'HeaderRight'
