import React from 'react'
import { cn } from '@/utils'

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'body' | 'bodyLarge' | 'bodySmall' | 'caption' | 'label' | 'muted'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  children: React.ReactNode
  as?: 'p' | 'span' | 'div' | 'label'
}

const textVariants = {
  body: 'text-base text-neutral-700',
  bodyLarge: 'text-lg text-neutral-700',
  bodySmall: 'text-sm text-neutral-700',
  caption: 'text-xs text-neutral-600',
  label: 'text-sm font-medium text-neutral-900',
  muted: 'text-sm text-neutral-500',
}

const textWeights = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
}

export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ variant = 'body', weight, as = 'p', className, children, ...props }, ref) => {
    const Component = as

    return (
      <Component
        ref={ref as any}
        className={cn(textVariants[variant], weight && textWeights[weight], className)}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Text.displayName = 'Text'
