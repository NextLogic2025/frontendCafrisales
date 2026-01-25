import React from 'react'
import { View, ViewProps } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type ScreenVariant = 'default' | 'withTabs' | 'fullScreen'

export interface ScreenLayoutProps extends ViewProps {
  children: React.ReactNode
  variant?: ScreenVariant
  backgroundColor?: string
  noPadding?: boolean
}

const TAB_BAR_HEIGHT = 60 // Adjust based on your TabBar height

export function ScreenLayout({
  children,
  variant = 'default',
  backgroundColor = 'bg-white',
  noPadding = false,
  className = '',
  ...props
}: ScreenLayoutProps) {
  const paddingBottom = variant === 'withTabs' ? TAB_BAR_HEIGHT : 0

  if (variant === 'fullScreen') {
    return (
      <View className={`flex-1 ${backgroundColor} ${className}`} {...props}>
        {children}
      </View>
    )
  }

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      className={`flex-1 ${backgroundColor}`}
      {...props}
    >
      <View
        style={{ paddingBottom }}
        className={`flex-1 ${noPadding ? '' : 'px-4'} ${className}`}
      >
        {children}
      </View>
    </SafeAreaView>
  )
}
