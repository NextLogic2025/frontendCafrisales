import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const buttonVariants = {
  primary: 'bg-red text-white hover:bg-red700 focus:ring-red/20',
  secondary: 'bg-gold text-neutral-900 hover:bg-gold/90 focus:ring-gold/20',
  ghost: 'bg-transparent text-red hover:bg-red/10 focus:ring-red/20',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600/20',
  outline: 'border-2 border-red text-red hover:bg-red hover:text-white focus:ring-red/20',
}

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2 rounded-lg font-semibold',
          'transition-all duration-200',
          'focus:outline-none focus:ring-4',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Variants
          buttonVariants[variant],
          buttonSizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && leftIcon && leftIcon}
        {children}
        {!loading && rightIcon && rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'
