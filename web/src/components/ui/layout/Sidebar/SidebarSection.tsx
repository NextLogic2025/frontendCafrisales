import React from 'react'
import { cn } from '@/utils'

export interface SidebarSectionProps {
  title?: string
  collapsed?: boolean
  children: React.ReactNode
  className?: string
}

export const SidebarSection = React.forwardRef<HTMLDivElement, SidebarSectionProps>(
  ({ title, collapsed = false, children, className }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-1', className)}>
        {title && !collapsed && (
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            {title}
          </h3>
        )}
        {children}
      </div>
    )
  }
)

SidebarSection.displayName = 'SidebarSection'
