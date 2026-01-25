import React from 'react'
import { cn } from '@/utils'

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel
  children: React.ReactNode
}

const headingStyles = {
  h1: 'text-4xl font-bold tracking-tight text-neutral-900',
  h2: 'text-3xl font-bold tracking-tight text-neutral-900',
  h3: 'text-2xl font-semibold text-neutral-900',
  h4: 'text-xl font-semibold text-neutral-900',
  h5: 'text-lg font-semibold text-neutral-900',
  h6: 'text-base font-semibold text-neutral-900',
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level = 'h2', className, children, ...props }, ref) => {
    const Component = level

    return (
      <Component ref={ref} className={cn(headingStyles[level], className)} {...props}>
        {children}
      </Component>
    )
  }
)

Heading.displayName = 'Heading'
