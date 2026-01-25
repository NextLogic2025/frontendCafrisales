import React from 'react'
import { cn } from '@/utils'

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  children: React.ReactNode
}

const containerSizes = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-[1400px]',
  full: 'max-w-full',
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ size = 'xl', children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', containerSizes[size], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Container.displayName = 'Container'
