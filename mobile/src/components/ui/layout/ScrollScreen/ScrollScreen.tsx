import React from 'react'
import { ScrollView, ScrollViewProps, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type ScreenVariant = 'default' | 'withTabs' | 'fullScreen'

export interface ScrollScreenProps extends ScrollViewProps {
  children: React.ReactNode
  variant?: ScreenVariant
  backgroundColor?: string
  noPadding?: boolean
  onRefresh?: () => void
  refreshing?: boolean
}

const TAB_BAR_HEIGHT = 60

export function ScrollScreen({
  children,
  variant = 'default',
  backgroundColor = 'bg-white',
  noPadding = false,
  onRefresh,
  refreshing = false,
  className = '',
  contentContainerStyle,
  ...props
}: ScrollScreenProps) {
  const paddingBottom = variant === 'withTabs' ? TAB_BAR_HEIGHT + 16 : 16

  const refreshControl = onRefresh ? (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor="#F0412D"
      colors={['#F0412D']}
    />
  ) : undefined

  if (variant === 'fullScreen') {
    return (
      <ScrollView
        className={`flex-1 ${backgroundColor}`}
        contentContainerStyle={[
          { paddingBottom, paddingHorizontal: noPadding ? 0 : 16 },
          contentContainerStyle,
        ]}
        refreshControl={refreshControl}
        {...props}
      >
        {children}
      </ScrollView>
    )
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} className={`flex-1 ${backgroundColor}`}>
      <ScrollView
        className={`flex-1 ${className}`}
        contentContainerStyle={[
          { paddingBottom, paddingHorizontal: noPadding ? 0 : 16 },
          contentContainerStyle,
        ]}
        refreshControl={refreshControl}
        {...props}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  )
}
