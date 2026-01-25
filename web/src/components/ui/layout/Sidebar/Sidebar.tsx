import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils'

export interface SidebarProps {
  children: React.ReactNode
  collapsed?: boolean
  onToggle?: () => void
  logo?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ children, collapsed = false, onToggle, logo, footer, className }, ref) => {
    return (
      <aside
        ref={ref}
        className={cn(
          'relative flex h-screen flex-col border-r border-neutral-200 bg-white transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          className
        )}
      >
        {/* Logo Section */}
        {logo && (
          <div className="flex h-16 items-center border-b border-neutral-200 px-4">
            <div className={cn('transition-opacity', collapsed && 'opacity-0')}>{logo}</div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {children}
        </nav>

        {/* Footer */}
        {footer && (
          <div className="border-t border-neutral-200 p-3">
            {footer}
          </div>
        )}

        {/* Toggle Button */}
        {onToggle && (
          <button
            onClick={onToggle}
            className={cn(
              'absolute -right-3 top-20 flex h-6 w-6 items-center justify-center',
              'rounded-full border border-neutral-200 bg-white shadow-sm',
              'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50',
              'transition-colors focus:outline-none focus:ring-2 focus:ring-red/20'
            )}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </aside>
    )
  }
)

Sidebar.displayName = 'Sidebar'
