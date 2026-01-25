import React from 'react'
import { cn } from '@/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helper?: string
  fullWidth?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helper, fullWidth = false, className, id, disabled, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-neutral-900">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-sm transition-colors',
            'placeholder:text-neutral-400',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            'resize-y',
            error
              ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
              : 'border-neutral-300 bg-white focus:border-red focus:ring-red/20',
            disabled && 'cursor-not-allowed opacity-50',
            className
          )}
          {...props}
        />

        {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        {helper && !error && <p className="text-xs text-neutral-500">{helper}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
