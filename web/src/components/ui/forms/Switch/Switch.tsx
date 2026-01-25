import React from 'react'
import { cn } from '@/utils'

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  onChange?: (checked: boolean) => void
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, onChange, className, id, checked, disabled, ...props }, ref) => {
    const switchId = id || label?.toLowerCase().replace(/\s+/g, '-')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked)
    }

    return (
      <label
        htmlFor={switchId}
        className={cn(
          'flex items-center gap-3 cursor-pointer group',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            id={switchId}
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'h-6 w-11 rounded-full border-2 transition-all',
              'peer-focus:ring-2 peer-focus:ring-red/20 peer-focus:ring-offset-1',
              'peer-checked:bg-red peer-checked:border-red',
              'border-neutral-300 bg-neutral-100',
              !disabled && 'group-hover:border-red/50'
            )}
          >
            <div
              className={cn(
                'h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                'peer-checked:translate-x-5'
              )}
            />
          </div>
        </div>

        {label && <span className="text-sm text-neutral-700 select-none">{label}</span>}
      </label>
    )
  }
)

Switch.displayName = 'Switch'
