import React from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '../../atoms/Input'
import { Select, SelectOption } from '../../forms/Select'
import { Button } from '../../atoms/Button'
import { cn } from '@/utils'

export interface Filter {
  id: string
  type: 'select'
  label: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
}

export interface FilterBarProps {
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  filters?: Filter[]
  onClearFilters?: () => void
  showClearButton?: boolean
  className?: string
}

export const FilterBar = React.forwardRef<HTMLDivElement, FilterBarProps>(
  (
    {
      searchValue = '',
      onSearchChange,
      searchPlaceholder = 'Buscar...',
      filters = [],
      onClearFilters,
      showClearButton = true,
      className,
    },
    ref
  ) => {
    const hasActiveFilters = searchValue || filters.some((f) => f.value)

    return (
      <div ref={ref} className={cn('flex flex-col gap-4 sm:flex-row sm:items-center', className)}>
        {/* Search */}
        {onSearchChange && (
          <div className="flex-1">
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              rightIcon={
                searchValue ? (
                  <button
                    onClick={() => onSearchChange('')}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : undefined
              }
            />
          </div>
        )}

        {/* Filters */}
        {filters.map((filter) => (
          <div key={filter.id} className="min-w-[200px]">
            <Select
              label={filter.label}
              options={filter.options}
              value={filter.value}
              onChange={filter.onChange}
              placeholder={`Seleccionar ${filter.label.toLowerCase()}`}
            />
          </div>
        ))}

        {/* Clear Filters Button */}
        {showClearButton && hasActiveFilters && onClearFilters && (
          <Button variant="ghost" onClick={onClearFilters} className="whitespace-nowrap">
            Limpiar filtros
          </Button>
        )}
      </div>
    )
  }
)

FilterBar.displayName = 'FilterBar'
