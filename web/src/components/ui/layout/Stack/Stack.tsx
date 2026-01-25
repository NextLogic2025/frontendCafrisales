import React from 'react'
import { cn } from '@/utils'

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column'
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: boolean
  children: React.ReactNode
}

const gapSizes = {
  none: '',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
  '2xl': 'gap-12',
}

const alignMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
}

const justifyMap = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      direction = 'column',
      gap = 'md',
      align = 'stretch',
      justify = 'start',
      wrap = false,
      children,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          direction === 'row' ? 'flex-row' : 'flex-col',
          gapSizes[gap],
          alignMap[align],
          justifyMap[justify],
          wrap && 'flex-wrap',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Stack.displayName = 'Stack'

export const HStack = React.forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>(
  (props, ref) => <Stack ref={ref} direction="row" {...props} />
)
HStack.displayName = 'HStack'

export const VStack = React.forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>(
  (props, ref) => <Stack ref={ref} direction="column" {...props} />
)
VStack.displayName = 'VStack'
