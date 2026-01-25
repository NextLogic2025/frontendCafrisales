import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/utils'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  error?: string
  onChange?: (checked: boolean) => void
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, onChange, className, id, checked, disabled, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked)
    }

    return (
      <div className={cn('flex flex-col gap-1', className)}>
        <label
          htmlFor={checkboxId}
          className={cn(
            'flex items-center gap-3 cursor-pointer group',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <div className="relative flex items-center">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              checked={checked}
              onChange={handleChange}
              disabled={disabled}
              className="peer sr-only"
              {...props}
            />
            <div
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all',
                'peer-focus:ring-2 peer-focus:ring-offset-1',
                error
                  ? 'border-red-500 peer-focus:ring-red-500/20'
                  : 'border-neutral-300 peer-focus:ring-red/20',
                'peer-checked:border-red peer-checked:bg-red',
                !disabled && 'group-hover:border-red'
              )}
            >
              {checked && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
            </div>
          </div>

          {label && <span className="text-sm text-neutral-700 select-none">{label}</span>}
        </label>

        {error && <p className="ml-8 text-xs font-medium text-red-600">{error}</p>}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'
