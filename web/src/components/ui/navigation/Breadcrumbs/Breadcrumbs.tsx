import React from 'react'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  showHome?: boolean
  homeHref?: string
  className?: string
}

export const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(
  ({ items, showHome = true, homeHref = '/', className }, ref) => {
    return (
      <nav ref={ref} className={cn('flex items-center gap-2 text-sm', className)}>
        {/* Home */}
        {showHome && (
          <>
            <a
              href={homeHref}
              className="flex items-center gap-1 text-neutral-600 transition-colors hover:text-red"
            >
              <Home className="h-4 w-4" />
              <span>Inicio</span>
            </a>
            <ChevronRight className="h-4 w-4 text-neutral-400" />
          </>
        )}

        {/* Breadcrumb Items */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <React.Fragment key={index}>
              {item.href ? (
                <a
                  href={item.href}
                  className="text-neutral-600 transition-colors hover:text-red"
                >
                  {item.label}
                </a>
              ) : (
                <span className="font-medium text-neutral-900">{item.label}</span>
              )}

              {!isLast && <ChevronRight className="h-4 w-4 text-neutral-400" />}
            </React.Fragment>
          )
        })}
      </nav>
    )
  }
)

Breadcrumbs.displayName = 'Breadcrumbs'
