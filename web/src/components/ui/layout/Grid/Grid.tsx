import React from 'react'
import { cn } from '@/utils'

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  responsive?: boolean
  children: React.ReactNode
}

const gridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
}

const gridColsResponsive = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  12: 'grid-cols-4 md:grid-cols-6 lg:grid-cols-12',
}

const gapSizes = {
  none: '',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
  '2xl': 'gap-12',
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ cols = 3, gap = 'md', responsive = true, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          responsive ? gridColsResponsive[cols] : gridCols[cols],
          gapSizes[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Grid.displayName = 'Grid'
