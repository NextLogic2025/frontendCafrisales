import clsx from 'clsx'
import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

type TextFieldProps = {
  label: string
  error?: string
  left?: React.ReactNode
  right?: React.ReactNode
} & InputHTMLAttributes<HTMLInputElement>

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, left, right, className, ...props }, ref) => {
    return (
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          {label}
        </span>
        <div
          className={clsx(
            'flex w-full items-center gap-3 rounded-xl border-2 bg-neutral-50 px-4 py-3 transition-all duration-200 focus-within:bg-white focus-within:shadow-md',
            {
              'border-red700 bg-red/5': !!error,
              'border-transparent focus-within:border-red': !error,
            },
            className
          )}
        >
          {left}
          <input
            ref={ref}
            className="flex-1 border-none bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400"
            {...props}
          />
          {right}
        </div>
        {error && <span className="text-xs font-medium text-red700">{error}</span>}
      </label>
    )
  }
)

TextField.displayName = 'TextField'
