import React from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/utils'

export interface Breadcrumb {
  label: string
  href?: string
}

export interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: Breadcrumb[]
  actions?: React.ReactNode
  className?: string
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ title, description, breadcrumbs, actions, className }, ref) => {
    return (
      <div ref={ref} className={cn('mb-8', className)}>
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-3 flex items-center gap-2 text-sm text-neutral-600">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight className="h-4 w-4" />}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="hover:text-red transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="font-medium text-neutral-900">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Title & Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">{title}</h1>
            {description && <p className="mt-2 text-sm text-neutral-600">{description}</p>}
          </div>

          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      </div>
    )
  }
)

PageHeader.displayName = 'PageHeader'
