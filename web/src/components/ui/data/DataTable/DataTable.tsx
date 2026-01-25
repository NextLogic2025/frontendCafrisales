import React from 'react'
import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react'
import { Spinner } from '../../atoms/Spinner'
import { EmptyState } from '../../feedback/EmptyState'
import { cn } from '@/utils'

export interface DataTableColumn<T> {
  key: string
  label: string
  sortable?: boolean
  render?: (row: T) => React.ReactNode
  className?: string
  headerClassName?: string
}

export interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (row: T) => void
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (key: string) => void
  className?: string
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No hay datos disponibles',
  onRowClick,
  sortBy,
  sortDirection,
  onSort,
  className,
}: DataTableProps<T>) {
  const handleSort = (key: string, sortable?: boolean) => {
    if (sortable && onSort) {
      onSort(key)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" text="Cargando datos..." />
      </div>
    )
  }

  if (data.length === 0) {
    return <EmptyState title={emptyMessage} />
  }

  return (
    <div className={cn('w-full overflow-x-auto rounded-lg border border-neutral-200', className)}>
      <table className="w-full">
        {/* Header */}
        <thead className="bg-neutral-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => handleSort(column.key, column.sortable)}
                className={cn(
                  'px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-700',
                  column.sortable && 'cursor-pointer select-none hover:bg-neutral-100',
                  column.headerClassName
                )}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && (
                    <span className="text-neutral-400">
                      {sortBy === column.key ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-neutral-200 bg-white">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'transition-colors',
                onRowClick && 'cursor-pointer hover:bg-neutral-50'
              )}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'whitespace-nowrap px-6 py-4 text-sm text-neutral-900',
                    column.className
                  )}
                >
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
