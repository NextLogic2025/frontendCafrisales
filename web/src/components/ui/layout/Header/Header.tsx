import React from 'react'
import { cn } from '@/utils'

export interface HeaderProps {
  children: React.ReactNode
  className?: string
}

export const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ children, className }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(
          'sticky top-0 z-40 flex h-16 items-center justify-between border-b border-neutral-200 bg-red px-6',
          className
        )}
      >
        {children}
      </header>
    )
  }
)

Header.displayName = 'Header'
