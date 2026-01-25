import React from 'react'
import { View, ViewProps } from 'react-native'

type StackDirection = 'row' | 'column'
type StackAlign = 'start' | 'center' | 'end' | 'stretch'
type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
type StackGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export interface StackProps extends ViewProps {
  children: React.ReactNode
  direction?: StackDirection
  align?: StackAlign
  justify?: StackJustify
  gap?: StackGap
  wrap?: boolean
  className?: string
}

const gapMap = {
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

export function Stack({
  children,
  direction = 'column',
  align = 'stretch',
  justify = 'start',
  gap = 'md',
  wrap = false,
  className = '',
  ...props
}: StackProps) {
  return (
    <View
      className={`
        ${direction === 'row' ? 'flex-row' : 'flex-col'}
        ${alignMap[align]}
        ${justifyMap[justify]}
        ${gapMap[gap]}
        ${wrap ? 'flex-wrap' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </View>
  )
}

export function HStack(props: Omit<StackProps, 'direction'>) {
  return <Stack {...props} direction="row" />
}

export function VStack(props: Omit<StackProps, 'direction'>) {
  return <Stack {...props} direction="column" />
}
