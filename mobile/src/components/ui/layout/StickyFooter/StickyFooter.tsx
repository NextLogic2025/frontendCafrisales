import React from 'react'
import { View, ViewProps, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export interface StickyFooterProps extends ViewProps {
  children: React.ReactNode
  backgroundColor?: string
  withBorder?: boolean
  className?: string
}

export function StickyFooter({
  children,
  backgroundColor = 'bg-white',
  withBorder = true,
  className = '',
  ...props
}: StickyFooterProps) {
  const insets = useSafeAreaInsets()

  return (
    <View
      style={{ paddingBottom: insets.bottom || 16 }}
      className={`
        px-4 pt-4
        ${backgroundColor}
        ${withBorder ? 'border-t border-neutral-200' : ''}
        ${Platform.OS === 'ios' ? 'shadow-2xl' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </View>
  )
}
