import React from 'react'
import { cn } from '@/utils'

export interface LinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const linkVariants = {
  primary: 'text-red hover:text-red700 focus:ring-red/20',
  secondary: 'text-neutral-600 hover:text-neutral-900 focus:ring-neutral-200',
  ghost: 'text-neutral-500 hover:text-red focus:ring-red/20',
}

const linkSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}

export const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ variant = 'primary', size = 'md', leftIcon, rightIcon, className, children, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(
          'inline-flex items-center gap-2 font-medium underline-offset-4',
          'hover:underline transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 rounded',
          linkVariants[variant],
          linkSizes[size],
          className
        )}
        {...props}
      >
        {leftIcon && leftIcon}
        {children}
        {rightIcon && rightIcon}
      </a>
    )
  }
)

LinkButton.displayName = 'LinkButton'
