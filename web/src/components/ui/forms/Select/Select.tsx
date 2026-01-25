import React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils'

export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string
  error?: string
  helper?: string
  options: SelectOption[]
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  fullWidth?: boolean
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helper,
      options,
      placeholder = 'Seleccionar...',
      value,
      onChange,
      fullWidth = false,
      className,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value)
    }

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-neutral-900">
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className={cn(
              'w-full appearance-none rounded-lg border px-3 py-2 pr-10 text-sm transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-offset-1',
              error
                ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                : 'border-neutral-300 bg-white focus:border-red focus:ring-red/20',
              disabled && 'cursor-not-allowed opacity-50',
              !value && 'text-neutral-400',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        </div>

        {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        {helper && !error && <p className="text-xs text-neutral-500">{helper}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
