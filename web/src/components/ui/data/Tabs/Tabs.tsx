import React from 'react'
import { cn } from '@/utils'

export interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
  badge?: string | number
  disabled?: boolean
}

export interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
  variant?: 'default' | 'pills'
  className?: string
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ tabs, activeTab, onChange, variant = 'default', className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex gap-1',
          variant === 'default' ? 'border-b border-neutral-200' : '',
          className
        )}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          const isDisabled = tab.disabled

          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && onChange(tab.id)}
              disabled={isDisabled}
              className={cn(
                'relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all',
                'focus:outline-none focus:ring-2 focus:ring-red/20 focus:ring-offset-1',
                variant === 'default' && [
                  'border-b-2 -mb-px',
                  isActive
                    ? 'border-red text-red'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300',
                ],
                variant === 'pills' && [
                  'rounded-lg',
                  isActive
                    ? 'bg-red text-white'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
                ],
                isDisabled && 'cursor-not-allowed opacity-50'
              )}
            >
              {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
              {tab.label}
              {tab.badge && (
                <span
                  className={cn(
                    'flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                    isActive && variant === 'pills'
                      ? 'bg-white text-red'
                      : 'bg-red text-white'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  }
)

Tabs.displayName = 'Tabs'
