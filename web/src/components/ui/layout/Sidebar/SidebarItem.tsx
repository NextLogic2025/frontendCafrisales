import React from 'react'
import { cn } from '@/utils'

export interface SidebarItemProps {
  icon?: React.ReactNode
  label: string
  active?: boolean
  collapsed?: boolean
  badge?: string | number
  onClick?: () => void
  href?: string
  className?: string
}

export const SidebarItem = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, SidebarItemProps>(
  ({ icon, label, active = false, collapsed = false, badge, onClick, href, className }, ref) => {
    const baseClasses = cn(
      'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
      active
        ? 'bg-red text-white'
        : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900',
      className
    )

    const content = (
      <>
        {icon && (
          <span className={cn('flex-shrink-0', collapsed ? 'mx-auto' : '')}>{icon}</span>
        )}

        {!collapsed && (
          <>
            <span className="flex-1 truncate">{label}</span>
            {badge && (
              <span
                className={cn(
                  'flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                  active ? 'bg-white text-red' : 'bg-red text-white'
                )}
              >
                {badge}
              </span>
            )}
          </>
        )}

        {/* Tooltip for collapsed state */}
        {collapsed && (
          <div className="absolute left-full ml-2 hidden rounded-md bg-neutral-900 px-2 py-1 text-xs text-white group-hover:block whitespace-nowrap z-50">
            {label}
            {badge && (
              <span className="ml-2 rounded-full bg-red px-1.5 py-0.5 text-white">
                {badge}
              </span>
            )}
          </div>
        )}
      </>
    )

    if (href) {
      return (
        <a ref={ref as any} href={href} className={baseClasses}>
          {content}
        </a>
      )
    }

    return (
      <button ref={ref as any} onClick={onClick} className={baseClasses}>
        {content}
      </button>
    )
  }
)

SidebarItem.displayName = 'SidebarItem'
