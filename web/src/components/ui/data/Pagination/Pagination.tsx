import React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '@/utils'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  className?: string
}

export const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  ({ currentPage, totalPages, onPageChange, showFirstLast = true, className }, ref) => {
    const canGoPrevious = currentPage > 1
    const canGoNext = currentPage < totalPages

    const getPageNumbers = () => {
      const pages: (number | string)[] = []
      const maxVisible = 5

      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(totalPages)
        } else if (currentPage >= totalPages - 2) {
          pages.push(1)
          pages.push('...')
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i)
          }
        } else {
          pages.push(1)
          pages.push('...')
          pages.push(currentPage - 1)
          pages.push(currentPage)
          pages.push(currentPage + 1)
          pages.push('...')
          pages.push(totalPages)
        }
      }

      return pages
    }

    return (
      <div ref={ref} className={cn('flex items-center justify-between', className)}>
        {/* Info */}
        <div className="text-sm text-neutral-600">
          Página <span className="font-medium">{currentPage}</span> de{' '}
          <span className="font-medium">{totalPages}</span>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-1">
          {/* First Page */}
          {showFirstLast && (
            <button
              onClick={() => onPageChange(1)}
              disabled={!canGoPrevious}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 transition-colors',
                canGoPrevious
                  ? 'text-neutral-700 hover:bg-neutral-50'
                  : 'cursor-not-allowed text-neutral-300'
              )}
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          )}

          {/* Previous Page */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canGoPrevious}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 transition-colors',
              canGoPrevious
                ? 'text-neutral-700 hover:bg-neutral-50'
                : 'cursor-not-allowed text-neutral-300'
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-neutral-400">
                  ...
                </span>
              )
            }

            const pageNumber = page as number
            const isActive = pageNumber === currentPage

            return (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                className={cn(
                  'flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-red bg-red text-white'
                    : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                )}
              >
                {pageNumber}
              </button>
            )
          })}

          {/* Next Page */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canGoNext}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 transition-colors',
              canGoNext
                ? 'text-neutral-700 hover:bg-neutral-50'
                : 'cursor-not-allowed text-neutral-300'
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Last Page */}
          {showFirstLast && (
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={!canGoNext}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 transition-colors',
                canGoNext
                  ? 'text-neutral-700 hover:bg-neutral-50'
                  : 'cursor-not-allowed text-neutral-300'
              )}
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    )
  }
)

Pagination.displayName = 'Pagination'
