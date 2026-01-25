import React from 'react'
import { cn } from '@/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helper,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-neutral-900">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-sm transition-colors',
              'placeholder:text-neutral-400',
              'focus:outline-none focus:ring-2 focus:ring-offset-1',
              error
                ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                : 'border-neutral-300 bg-white focus:border-red focus:ring-red/20',
              disabled && 'cursor-not-allowed opacity-50',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        {helper && !error && <p className="text-xs text-neutral-500">{helper}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
