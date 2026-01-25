import React from 'react'
import { cn } from '@/utils'

export interface RadioOption {
  label: string
  value: string
  disabled?: boolean
}

export interface RadioGroupProps {
  label?: string
  error?: string
  options: RadioOption[]
  value?: string
  onChange?: (value: string) => void
  name: string
  disabled?: boolean
  className?: string
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ label, error, options, value, onChange, name, disabled = false, className }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-col gap-2', className)}>
        {label && <span className="text-sm font-medium text-neutral-900">{label}</span>}

        <div className="flex flex-col gap-2">
          {options.map((option) => {
            const isSelected = value === option.value
            const isDisabled = disabled || option.disabled

            return (
              <label
                key={option.value}
                className={cn(
                  'flex items-center gap-3 cursor-pointer group',
                  isDisabled && 'cursor-not-allowed opacity-50'
                )}
              >
                <div className="relative flex items-center">
                  <input
                    type="radio"
                    name={name}
                    value={option.value}
                    checked={isSelected}
                    onChange={(e) => onChange?.(e.target.value)}
                    disabled={isDisabled}
                    className="peer sr-only"
                  />
                  <div
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all',
                      'peer-focus:ring-2 peer-focus:ring-red/20 peer-focus:ring-offset-1',
                      error ? 'border-red-500' : 'border-neutral-300',
                      'peer-checked:border-red peer-checked:bg-white',
                      !isDisabled && 'group-hover:border-red'
                    )}
                  >
                    {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-red" />}
                  </div>
                </div>

                <span className="text-sm text-neutral-700 select-none">{option.label}</span>
              </label>
            )
          })}
        </div>

        {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      </div>
    )
  }
)

RadioGroup.displayName = 'RadioGroup'
