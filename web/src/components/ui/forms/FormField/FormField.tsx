import React from 'react'
import { cn } from '@/utils'

export interface FormFieldProps {
  label?: string
  error?: string
  helper?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, helper, required = false, children, className }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-col gap-1.5', className)}>
        {label && (
          <label className="text-sm font-medium text-neutral-900">
            {label}
            {required && <span className="ml-1 text-red">*</span>}
          </label>
        )}

        {children}

        {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        {helper && !error && <p className="text-xs text-neutral-500">{helper}</p>}
      </div>
    )
  }
)

FormField.displayName = 'FormField'
