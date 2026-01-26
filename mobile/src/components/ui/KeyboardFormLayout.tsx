import React from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, ScrollViewProps, StyleProp, ViewStyle } from 'react-native'
import { useHeaderHeight } from '@react-navigation/elements'

type KeyboardFormLayoutProps = {
  children: React.ReactNode
  contentContainerStyle?: StyleProp<ViewStyle>
  scrollProps?: ScrollViewProps
  keyboardOffset?: number
}

export function KeyboardFormLayout({
  children,
  contentContainerStyle,
  scrollProps,
  keyboardOffset,
}: KeyboardFormLayoutProps) {
  const headerHeight = useHeaderHeight?.() ?? 0
  const verticalOffset = keyboardOffset ?? headerHeight + 8

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={verticalOffset}
      style={{ flex: 1 }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[{ paddingBottom: 32 }, contentContainerStyle]}
        {...scrollProps}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
