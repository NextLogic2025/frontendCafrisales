import React from 'react'
import { LucideIcon } from 'lucide-react'
import { Button } from '../../atoms/Button'
import { cn } from '@/utils'

export interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon: Icon, title, description, actionLabel, onAction, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col items-center justify-center p-12 text-center', className)}
      >
        {Icon && (
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
            <Icon className="h-8 w-8 text-neutral-400" />
          </div>
        )}

        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>

        {description && <p className="mt-2 max-w-sm text-sm text-neutral-600">{description}</p>}

        {actionLabel && onAction && (
          <Button variant="primary" onClick={onAction} className="mt-6">
            {actionLabel}
          </Button>
        )}
      </div>
    )
  }
)

EmptyState.displayName = 'EmptyState'
